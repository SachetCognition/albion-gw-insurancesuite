package albion.integration.shadow

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.util.HashMap
uses java.util.Map
uses org.easymock.EasyMock

class ShadowRecordFacadeTest extends TestBase {

  private function bean(brand : String) : KeyableBean {
    var src = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.replay(src)
    return src
  }

  private function withFlags(flags : Map<String, String>, test : block()) {
    var values = new HashMap<String, String>()
    for (k in flags.Keys) {
      values.put(AlbionCentre.PROPERTY_PREFIX + "." + k, flags.get(k))
    }
    var recorder = new InMemoryShadowDiffRecorder()
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    ShadowRecordFacade.setRecorder(recorder)
    try {
      test()
    } finally {
      AlbionConfigService.setInstance(null)
      ShadowRecordFacade.setRecorder(null)
    }
  }

  private function recorder() : InMemoryShadowDiffRecorder {
    return ShadowRecordFacade.Recorder as InMemoryShadowDiffRecorder
  }

  function testFlagsOffRunLegacyOnlyAndNeverTouchTheCandidate() {
    withFlags(new HashMap<String, String>(), \ -> {
      var src = EasyMock.createMock(KeyableBean)
      EasyMock.replay(src)
      var record = ShadowRecordFacade.buildRecord("IPT", src, \ b -> "LEGACY", \ b -> {
        throw new IllegalStateException("candidate must not run")
      })
      assertEquals("LEGACY", record)
      EasyMock.verify(src)
      assertEquals(0, recorder().RecordCount)
    })
  }

  function testTemplateValuesKeepEveryFeedDormant() {
    withFlags({"feature.shadow.enabled" -> "false", "feature.shadow.feeds" -> "", "feature.shadow.brands" -> ""}, \ -> {
      assertFalse(ShadowRecordFacade.shadowEnabled("IPT", bean("ALBDIR")))
      assertFalse(ShadowRecordFacade.shadowEnabled("POLARIS_MF", bean("ALBDIR")))
    })
  }

  function testFeedListedButMasterSwitchOffStaysDormant() {
    withFlags({"feature.shadow.enabled" -> "false", "feature.shadow.feeds" -> "IPT"}, \ -> {
      assertFalse(ShadowRecordFacade.shadowEnabled("IPT", bean("ALBDIR")))
    })
  }

  function testEnabledFeedRecordsDifferenceAndReturnsLegacy() {
    withFlags({"feature.shadow.enabled" -> "true", "feature.shadow.feeds" -> "ipt, POLARIS_MF"}, \ -> {
      var record = ShadowRecordFacade.buildRecord("IPT", bean("HERIT"), \ b -> "LEGACY", \ b -> "CANDIDATE")
      assertEquals("LEGACY", record)
      assertEquals(1, recorder().RecordCount)
      assertEquals("IPT", recorder().LastResult.FeedName)
      assertEquals("HERIT", recorder().LastResult.BrandCode)
      assertFalse(ShadowRecordFacade.shadowEnabled("CUE", bean("HERIT")))
    })
  }

  function testBrandAllowListLimitsTheShadowRun() {
    withFlags({"feature.shadow.enabled" -> "true", "feature.shadow.feeds" -> "IPT", "feature.shadow.brands" -> "HERIT"}, \ -> {
      assertTrue(ShadowRecordFacade.shadowEnabled("IPT", bean("HERIT")))
      assertFalse(ShadowRecordFacade.shadowEnabled("IPT", bean("ALBBRK")))
      // heritage rows with no brand resolve to ALBDIR (BrandMappingService.brandOf)
      assertFalse(ShadowRecordFacade.shadowEnabled("IPT", bean(null)))
    })
  }

  function testCandidateFailureNeverReachesTheFeed() {
    withFlags({"feature.shadow.enabled" -> "true", "feature.shadow.feeds" -> "IPT"}, \ -> {
      var record = ShadowRecordFacade.buildRecord("IPT", bean("ALBDIR"), \ b -> "LEGACY", \ b -> {
        throw new IllegalStateException("candidate defect")
      })
      assertEquals("LEGACY", record)
      assertEquals(ReconciliationResult.CANDIDATE_ERROR, recorder().LastResult.Outcome)
    })
  }

  function testInvalidFlagValueIsTreatedAsOff() {
    withFlags({"feature.shadow.enabled" -> "yes", "feature.shadow.feeds" -> "IPT"}, \ -> {
      assertEquals("LEGACY", ShadowRecordFacade.buildRecord("IPT", bean("ALBDIR"), \ b -> "LEGACY", \ b -> "CANDIDATE"))
      assertEquals(0, recorder().RecordCount)
    })
  }

  function testDefaultRecorderLogs() {
    ShadowRecordFacade.setRecorder(null)
    assertTrue(ShadowRecordFacade.Recorder typeis LoggingShadowDiffRecorder)
  }
}
