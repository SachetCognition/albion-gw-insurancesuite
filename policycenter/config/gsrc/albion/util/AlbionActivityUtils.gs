package albion.util

uses gw.api.util.DateUtil
uses gw.pl.logging.LoggerCategory

/*
 * AlbionActivityUtils - raises review activities from Albion rules and batches.
 *
 *  01/01/2011   svenkat      REG-42795: Do not change without speaking to actuarial
 *  19/12/2012   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (CHG-32220)
 *  06/09/2013   nchen        Merged from heritage branch (CHG-33615)
 *  12/07/2014   kmbeki       CR GWCC-23732 - added ALBBRK brand handling
 *  23/02/2016   vraghu       Rewritten during Project Mercury, old logic kept below commented out (GWPC-4528)
 *  23/10/2017   rpatel       Initial version for DEF-5063
 *  22/10/2019   pnair        Emergency prod fix DEF-7400 - DO NOT REVERT
 *  25/03/2020   gferran      Regulatory change CM-15111 (FCA GI pricing remedy)
 *  12/11/2021   mokeefe      AGI-1545: Do not change without speaking to actuarial
 *  16/09/2022   cdoyle       Regulatory change REG-37821 (FCA GI pricing remedy)
 *  26/07/2024   svenkat      Merged from heritage branch (HERIT-8916)
 *  12/10/2026   AGI-GW Platform  Reduced to raiseActivity; unused placeholder helpers removed
 */
class AlbionActivityUtils {

  /**
   * Creates an Activity from the ActivityPattern with the given code, linked to the policy, account and job of the
   * bean (PolicyPeriod or Job). Returns null, and logs a warning, when no pattern with that code is loaded.
   */
  static function raiseActivity(bean : KeyableBean, patternCode : String, subject : String) : Activity {
    var pattern = ActivityPattern.finder.getActivityPatternByCode(patternCode)
    if (pattern == null) {
      LoggerCategory.CONFIG.warn("AlbionActivityUtils: no activity pattern " + patternCode + " for " + bean)
      return null
    }
    var activity = new Activity(bean.Bundle)
    activity.ActivityPattern = pattern
    activity.Type = pattern.Type
    activity.Priority = pattern.Priority
    activity.Mandatory = pattern.Mandatory
    activity.Subject = subject == null ? pattern.Subject : subject
    activity.Description = pattern.Description
    activity.TargetDate = DateUtil.currentDate()
    if (bean typeis PolicyPeriod) {
      activity.Policy = bean.Policy
      activity.Account = bean.Policy.Account
      activity.Job = bean.Job
    } else if (bean typeis Job) {
      activity.Policy = bean.Policy
      activity.Account = bean.Policy.Account
      activity.Job = bean
    }
    return activity
  }
}
