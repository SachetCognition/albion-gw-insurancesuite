package albion.policy.common

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses java.util.Date
uses java.util.HashMap
uses java.util.Map
uses org.easymock.EasyMock

/** Test fixtures for the PolicyCenter rule classes: field-backed bean mocks and an isolated AlbionConfigService. */
class AlbionPolicyTestBeans {

  private construct() {
  }

  static function bean(fields : Map<String, Object>) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    expectFields(b, fields)
    EasyMock.replay({b})
    return b
  }

  static function policyPeriod(fields : Map<String, Object>, periodStart : Date, sourceSystem : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    expectFields(p, fields)
    EasyMock.expect(p.PeriodStart).andReturn(periodStart).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(sourceSystem).anyTimes()
    EasyMock.replay({p})
    return p
  }

  static function job(fields : Map<String, Object>, latestPeriod : PolicyPeriod, sourceSystem : String) : Job {
    var j = EasyMock.createNiceMock(Job)
    expectFields(j, fields)
    EasyMock.expect(j.LatestPeriod).andReturn(latestPeriod).anyTimes()
    EasyMock.expect(j.SourceSystem_Ext).andReturn(sourceSystem).anyTimes()
    EasyMock.replay({j})
    return j
  }

  static function daysAgo(days : int) : Date {
    return new Date(System.currentTimeMillis() - (days as long) * 24L * 60L * 60L * 1000L)
  }

  /** Installs a config holding only the given fully-qualified (po.*) keys; callers reset with AlbionConfigService.setInstance(null). */
  static function useConfig(values : Map<String, String>) {
    var copy = new HashMap<String, String>()
    if (values != null) {
      copy.putAll(values)
    }
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, copy))
  }

  static function outcomes(result : List<String>) : String {
    return String.join(",", result)
  }

  private static function expectFields(b : KeyableBean, fields : Map<String, Object>) {
    if (fields == null) {
      return
    }
    for (k in fields.Keys) {
      EasyMock.expect(b.getFieldValue(k)).andReturn(fields.get(k)).anyTimes()
    }
  }
}
