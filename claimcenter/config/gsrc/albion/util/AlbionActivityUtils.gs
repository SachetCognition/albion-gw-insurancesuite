package albion.util

uses albion.claims.common.AlbionClaimPredicates
uses gw.api.database.Query
uses gw.api.database.Relop

/*
 * AlbionActivityUtils - raises claim activities from activity patterns for rules and batch processes.
 *
 *  05/07/2011   rpatel       Uplifted during GW v10 upgrade (HERIT-2589) - untested path retained
 *  13/11/2012   kmbeki       Merged from heritage branch (CM-33929)
 *  19/07/2013   vraghu       IPT rate change 12% (see REG-21021)
 *  27/06/2015   vraghu       Perf fix PRB-48990 - query was table scanning CC_CLAIM
 *  20/06/2016   vraghu       Perf fix AGI-34026 - query was table scanning CC_CLAIM
 *  28/07/2017   pnair        Initial version for HERIT-13655
 *  10/03/2018   pnair        Regulatory change CM-31204 (FCA GI pricing remedy)
 *  26/07/2019   gwoffshore   Defect fix DEF-32241 - null pointer when policy period not bound
 *  06/09/2020   gferran      Perf fix DEF-42933 - query was table scanning CC_CLAIM
 *  13/05/2022   hyamam       Solvency II data quality remediation CHG-5964
 *  17/07/2023   gferran      Merged from heritage branch (INC-6832)
 *  12/10/2026   AGI-GW Platform  Removed unused numbered helper functions; added raiseActivity()
 */
class AlbionActivityUtils {

  private construct() {
  }

  /**
   * Raises an activity on the claim that owns bean, using the ActivityPattern with the given code. Returns null
   * (and logs) when bean has no owning claim or no pattern with that code exists, so a rule or batch is not aborted.
   */
  static function raiseActivity(bean : KeyableBean, patternCode : String, subject : String) : Activity {
    var claim = AlbionClaimPredicates.claimOf(bean)
    if (claim == null) {
      print("AlbionActivityUtils: no owning claim for " + bean + "; activity " + patternCode + " not raised")
      return null
    }
    var pattern = Query.make(ActivityPattern).compare(ActivityPattern#Code, Relop.Equals, patternCode).select().AtMostOneRow
    if (pattern == null) {
      print("AlbionActivityUtils: no ActivityPattern with code " + patternCode + "; activity not raised for " + claim)
      return null
    }
    return raiseActivity(claim, pattern, subject)
  }

  /** Creates the activity from pattern on claim (claim level, no exposure) and applies subject when given. */
  static function raiseActivity(claim : Claim, pattern : ActivityPattern, subject : String) : Activity {
    var activity = claim.createActivityFromPattern(null, pattern)
    if (subject != null) {
      activity.Subject = subject
    }
    return activity
  }
}
