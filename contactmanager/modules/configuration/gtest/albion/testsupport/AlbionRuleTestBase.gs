package albion.testsupport

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.util.ArrayList
uses java.util.Calendar
uses java.util.List
uses java.util.Map
uses org.easymock.EasyMock

/**
 * Shared fixtures for the ContactManager rule-class tests: mocked beans exposing fields through getFieldValue,
 * an aggregator-sourced ABContact, and a scoped AlbionConfigService override.
 */
abstract class AlbionRuleTestBase extends TestBase {

  /** A KeyableBean whose getFieldValue returns the given values (null for any other field). */
  protected function bean(fields : Map<String, Object>) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    for (name in fields.Keys) {
      EasyMock.expect(b.getFieldValue(name)).andStubReturn(fields.get(name))
    }
    EasyMock.replay(b)
    return b
  }

  /** An ABContact created through a price-comparison aggregator (SourceSystem_Ext = "AGGR"). */
  protected function aggregatorContact(fields : Map<String, Object>) : ABContact {
    return contactWithSource("AGGR", fields)
  }

  protected function contactWithSource(sourceSystem : String, fields : Map<String, Object>) : ABContact {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(sourceSystem)
    for (name in fields.Keys) {
      EasyMock.expect(c.getFieldValue(name)).andStubReturn(fields.get(name))
    }
    EasyMock.replay(c)
    return c
  }

  /** Runs the test with the given full property keys (e.g. "co.fraud.refer.score") as the active configuration. */
  protected function withConfig(values : Map<String, String>, test : block()) {
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      test()
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  /**
   * Expected rule actions. Items prefixed with "?" are only expected from July to December
   * (the subsidence summer-surge protocol reads the current month).
   */
  protected function actions(items : String[]) : List<String> {
    var result = new ArrayList<String>()
    for (item in items) {
      if (item.startsWith("?")) {
        if (Calendar.getInstance().get(Calendar.MONTH) > 5) {
          result.add(item.substring(1))
        }
      } else {
        result.add(item)
      }
    }
    return result
  }
}
