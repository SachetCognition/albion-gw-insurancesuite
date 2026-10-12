package albion.util

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

class AlbionActivityUtilsTest extends AlbionRuleTestBase {

  function testNoActivityForNullBeanOrPattern() {
    assertNull(AlbionActivityUtils.raiseActivity(null, "escalation_pi", "subject"))
    assertNull(AlbionActivityUtils.raiseActivity(bean(new HashMap<String, Object>()), null, "subject"))
  }

  function testNoActivityWhenPatternIsNotConfigured() {
    assertNull(AlbionActivityUtils.raiseActivity(bean(new HashMap<String, Object>()), "no_such_pattern_code", "subject"))
  }
}
