package albion.util

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.util.DateUtil

/*
 * AlbionActivityUtils - raises review activities from Albion rules and batches.
 *
 *  02/12/2012   gwoffshore   Uplifted during GW v10 upgrade (REG-8512) - untested path retained
 *  10/01/2013   gwoffshore   Merged from heritage branch (GWBC-26196)
 *  11/08/2014   jsuther      IPT rate change 12% (see DEF-47973)
 *  06/11/2015   mokeefe      Emergency prod fix HERIT-19020 - DO NOT REVERT
 *  26/02/2016   svenkat      Emergency prod fix DEF-38686 - DO NOT REVERT
 *  01/11/2020   svenkat      PRB-25835: Do not change without speaking to actuarial
 *  16/03/2021   jsuther      Merged from heritage branch (CM-25385)
 *  20/12/2022   mokeefe      Regulatory change GWPC-7604 (FCA GI pricing remedy)
 *  08/08/2023   jsuther      IPT rate change 12% (see GWPC-14159)
 *  17/05/2024   nchen        Solvency II data quality remediation REG-6804
 *  15/11/2025   pnair        Emergency prod fix REG-37220 - DO NOT REVERT
 *  12/10/2026   AGI-GW Platform  Replaced unused numbered helpers with raiseActivity()
 *  12/10/2026   AGI-GW Platform  raiseActivity applies the pattern mandatory flag and target/escalation days
 */
class AlbionActivityUtils {

  private construct() {
  }

  /** The ActivityPattern with the given code, or null when none is configured. */
  static function findPattern(patternCode : String) : ActivityPattern {
    if (patternCode == null) {
      return null
    }
    return Query.make(ActivityPattern).compare(ActivityPattern#Code, Relop.Equals, patternCode).select().AtMostOneRow
  }

  /**
   * Creates an Activity from the ActivityPattern with patternCode, in the bean's bundle, linked to the bean's
   * account where it has one. Mandatory flag and target/escalation dates (calendar days from today) come from
   * the pattern. Returns null (and creates nothing) when the pattern is not configured.
   */
  static function raiseActivity(bean : KeyableBean, patternCode : String, subject : String) : Activity {
    if (bean == null) {
      throw new IllegalArgumentException("bean is mandatory")
    }
    var pattern = findPattern(patternCode)
    if (pattern == null) {
      print("AlbionActivityUtils: no ActivityPattern '" + patternCode + "'; activity not raised for " + bean)
      return null
    }
    var activity = new Activity(bean.Bundle)
    activity.ActivityPattern = pattern
    activity.Subject = subject ?: pattern.Subject
    activity.Description = pattern.Description
    activity.Priority = pattern.Priority
    activity.Mandatory = pattern.Mandatory
    if (pattern.TargetDays != null) {
      activity.TargetDate = DateUtil.currentDate().addDays(pattern.TargetDays)
    }
    if (pattern.EscalationDays != null) {
      activity.EscalationDate = DateUtil.currentDate().addDays(pattern.EscalationDays)
    }
    if (bean typeis AccountInvoice) {
      activity.Account = bean.Account
    } else if (bean typeis Account) {
      activity.Account = bean
    } else if (bean typeis PolicyPeriod) {
      activity.PolicyPeriod = bean
    }
    return activity
  }
}
