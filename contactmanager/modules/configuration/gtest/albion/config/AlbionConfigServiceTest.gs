package albion.config

uses gw.testharness.TestBase
uses java.io.File
uses java.io.FileWriter
uses java.util.HashMap
uses java.util.Map

class AlbionConfigServiceTest extends TestBase {

  private function svc(values : Map<String, String>) : AlbionConfigService {
    return new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values)
  }

  private function key(k : String) : String {
    return AlbionCentre.PROPERTY_PREFIX + "." + k
  }

  function testDefaultsEqualTodaysHardcodedValues() {
    var s = svc(new HashMap<String, String>())
    assertEquals(55, s.FraudReferScore)
    assertEquals(0, 0.12bd.compareTo(s.IptStandardRate))
    assertEquals(0, 25000bd.compareTo(s.LargeLossThreshold))
    assertEquals(0, 10000bd.compareTo(s.ReferThresholdAlbDir))
    assertEquals(0, 4000bd.compareTo(s.ReferThresholdAlbBrk))
    assertEquals(3, s.CreditHireMitigationSlaHours)
    assertEquals(4, s.CatEventDeclareSlaHours)
    assertEquals(3, s.ComplaintAckPromiseDays)
    assertEquals(5, s.ComplaintAckRegulatoryDays)
    assertEquals(28, s.ComplaintHoldingLetterDays)
    assertEquals(56, s.ComplaintFinalResponseDays)
    assertTrue(s.validationErrors().Empty)
  }

  function testReadsOnlyThisCentresPrefix() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_FRAUD_REFER_SCORE), "60")
    values.put("zz." + AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD, "1")
    values.put(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD, "2")
    var s = svc(values)
    assertEquals(60, s.FraudReferScore)
    assertEquals(0, 25000bd.compareTo(s.LargeLossThreshold))
    assertEquals(key("fraud.refer.score"), s.fullKey("fraud.refer.score"))
  }

  function testStripsInlineCommentsAndWhitespace() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD), "  50000   # signed off by UW committee")
    values.put(key(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR), "   ")
    var s = svc(values)
    assertEquals(0, 50000bd.compareTo(s.LargeLossThreshold))
    assertEquals("50000", s.rawValue(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD))
    assertNull(s.rawValue(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR))
    assertEquals(0, 10000bd.compareTo(s.ReferThresholdAlbDir))
  }

  function testIptStandardRateFallsBackToExistingIptRateKey() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_IPT_RATE_LEGACY), "0.125")
    assertEquals(0, 0.125bd.compareTo(svc(values).IptStandardRate))
    values.put(key(AlbionConfigService.KEY_IPT_STANDARD_RATE), "0.12")
    assertEquals(0, 0.12bd.compareTo(svc(values).IptStandardRate))
  }

  function testLegacyPinnedThresholdsAreBehaviourNeutral() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD), "25000")
    var s = svc(values)
    assertEquals(0, 100000bd.compareTo(s.largeLossThreshold("CreditInboundHandler", 100000bd)))
    assertEquals(0, 25000bd.compareTo(s.largeLossThreshold("CreditInboundHandler", null)))
    assertEquals(0, 25000bd.compareTo(s.largeLossThreshold(null, null)))
    assertEquals(0, 7500bd.compareTo(s.referThresholdAlbDir("FloodreInboundHandler", 7500bd)))
    assertEquals(0, 2500bd.compareTo(s.referThresholdAlbBrk("FloodreInboundHandler", 2500bd)))
    assertEquals(0, 10000bd.compareTo(svc(new HashMap<String, String>()).referThresholdAlbDir(null, null)))
  }

  function testScopedKeyOverridesLegacyValue() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD + ".CreditInboundHandler"), "150000")
    values.put(key(AlbionConfigService.KEY_REFER_THRESHOLD_ALBBRK + ".MidInboundHandler"), "4500")
    var s = svc(values)
    assertEquals(0, 150000bd.compareTo(s.largeLossThreshold("CreditInboundHandler", 100000bd)))
    assertEquals(0, 100000bd.compareTo(s.largeLossThreshold("OtherHandler", 100000bd)))
    assertEquals(0, 4500bd.compareTo(s.referThresholdAlbBrk(" MidInboundHandler ", 4000bd)))
  }

  function testUnparseableValueFailsFastNamingTheKey() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_FRAUD_REFER_SCORE), "fifty-five")
    values.put(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD), "25k")
    var s = svc(values)
    try {
      var score = s.FraudReferScore
      fail("Expected IllegalStateException, got " + score)
    } catch (e : IllegalStateException) {
      assertTrue(e.Message.contains(key(AlbionConfigService.KEY_FRAUD_REFER_SCORE)))
      assertTrue(e.Message.contains("fifty-five"))
    }
    try {
      var threshold = s.LargeLossThreshold
      fail("Expected IllegalStateException, got " + threshold)
    } catch (e : IllegalStateException) {
      assertTrue(e.Message.contains(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD)))
    }
    assertEquals(2, s.validationErrors().size())
  }

  function testOutOfRangeValuesAreRejected() {
    var cases = new HashMap<String, String>()
    cases.put(AlbionConfigService.KEY_FRAUD_REFER_SCORE, "101")
    cases.put(AlbionConfigService.KEY_IPT_STANDARD_RATE, "1.0")
    cases.put(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR, "-1")
    cases.put(AlbionConfigService.KEY_SLA_CREDIT_HIRE_MITIGATION_HOURS, "0")
    for (k in cases.keySet()) {
      var values = new HashMap<String, String>()
      values.put(key(k), cases.get(k))
      var errors = svc(values).validationErrors()
      assertEquals(k, 1, errors.size())
      assertTrue(errors.get(0), errors.get(0).contains(key(k)))
    }
  }

  function testValidateChecksSlaConsistency() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS), "6")
    values.put(key(AlbionConfigService.KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS), "56")
    var s = svc(values)
    assertEquals(2, s.validationErrors().size())
    try {
      s.validate()
      fail("Expected IllegalStateException")
    } catch (e : IllegalStateException) {
      assertTrue(e.Message.contains(key(AlbionConfigService.KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS)))
      assertTrue(e.Message.contains(key(AlbionConfigService.KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS)))
    }
  }

  function testBooleanAndStringGetters() {
    var values = new HashMap<String, String>()
    values.put(key("feature.x.enabled"), "TRUE")
    values.put(key("feature.y.enabled"), "yes")
    values.put(key("name"), " value ")
    var s = svc(values)
    assertTrue(s.getBoolean("feature.x.enabled", false))
    assertFalse(s.getBoolean("feature.z.enabled", false))
    assertEquals("value", s.getString("name", "dflt"))
    assertEquals("dflt", s.getString("missing", "dflt"))
    try {
      s.getBoolean("feature.y.enabled", false)
      fail("Expected IllegalStateException")
    } catch (e : IllegalStateException) {
      assertTrue(e.Message.contains(key("feature.y.enabled")))
    }
  }

  function testEveryBusinessKeyIsValidated() {
    assertEquals(11, AlbionConfigService.BUSINESS_KEYS.size())
    for (k in AlbionConfigService.BUSINESS_KEYS) {
      var values = new HashMap<String, String>()
      values.put(key(k), "not-a-number")
      var errors = svc(values).validationErrors()
      assertEquals(k, 1, errors.size())
      assertTrue(errors.get(0), errors.get(0).contains(key(k)))
    }
  }

  function testEmptyPrefixIsRejected() {
    try {
      new AlbionConfigService(" ", new HashMap<String, String>())
      fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      assertNotNull(e.Message)
    }
  }

  function testFromEnvironmentReadsFileAndSystemPropertiesOverride() {
    var file = File.createTempFile("albion-config", ".properties")
    file.deleteOnExit()
    using (var w = new FileWriter(file)) {
      w.write(key(AlbionConfigService.KEY_FRAUD_REFER_SCORE) + "=60\n")
      w.write(key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD) + "=30000   # inline comment\n")
    }
    var overrideKey = key(AlbionConfigService.KEY_LARGE_LOSS_THRESHOLD)
    var oldFile = System.getProperty(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY)
    var oldOverride = System.getProperty(overrideKey)
    try {
      System.setProperty(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY, file.AbsolutePath)
      var fromFile = AlbionConfigService.fromEnvironment(AlbionCentre.PROPERTY_PREFIX)
      assertEquals(60, fromFile.FraudReferScore)
      assertEquals(0, 30000bd.compareTo(fromFile.LargeLossThreshold))

      System.setProperty(overrideKey, "40000")
      var overridden = AlbionConfigService.fromEnvironment(AlbionCentre.PROPERTY_PREFIX)
      assertEquals(0, 40000bd.compareTo(overridden.LargeLossThreshold))
      assertEquals(60, overridden.FraudReferScore)
    } finally {
      restore(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY, oldFile)
      restore(overrideKey, oldOverride)
    }
  }

  function testMissingConfigFileFailsFast() {
    var old = System.getProperty(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY)
    try {
      System.setProperty(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY, "/nonexistent/albion/" + System.nanoTime() + ".properties")
      AlbionConfigService.fromEnvironment(AlbionCentre.PROPERTY_PREFIX)
      fail("Expected IllegalStateException")
    } catch (e : IllegalStateException) {
      assertTrue(e.Message.contains(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY))
    } finally {
      restore(AlbionConfigService.CONFIG_FILE_SYSTEM_PROPERTY, old)
    }
  }

  function testSharedInstanceCanBeReplaced() {
    var values = new HashMap<String, String>()
    values.put(key(AlbionConfigService.KEY_FRAUD_REFER_SCORE), "70")
    var custom = svc(values)
    try {
      AlbionConfigService.setInstance(custom)
      assertSame(custom, AlbionConfigService.Instance)
      assertEquals(70, AlbionConfigService.Instance.FraudReferScore)
      assertEquals(AlbionCentre.PROPERTY_PREFIX, AlbionConfigService.Instance.Prefix)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  private function restore(name : String, value : String) {
    if (value == null) {
      System.clearProperty(name)
    } else {
      System.setProperty(name, value)
    }
  }
}
