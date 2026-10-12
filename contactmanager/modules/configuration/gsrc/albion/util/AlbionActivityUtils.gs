package albion.util

uses gw.api.database.Query
uses gw.api.database.Relop

/*
 * AlbionActivityUtils - the activity raising "utility" class.
 *
 * 2011: 4 methods. Today: you're looking at it. Every attempt to split this class
 * (GWBC-36014, DEF-29958, DEF-3679) was abandoned mid-flight; partial extractions exist in
 * albion.util.v2 and albion.common - all three are referenced in production.
 *
 *  25/12/2011   cdoyle       Merged from heritage branch (GWBC-17504)
 *  16/01/2012   mokeefe      Solvency II data quality remediation GWCC-6142
 *  02/01/2013   hyamam       Regulatory change AGI-17440 (FCA GI pricing remedy)
 *  23/08/2014   pnair        GWCC-17588: Do not change without speaking to actuarial
 *  20/02/2015   jsuther      CR GWCC-33469 - added HERIT brand handling
 *  23/11/2017   baldrid      CR CHG-26798 - added ALBDIR brand handling
 *  02/05/2018   mokeefe      Uplifted during GW v10 upgrade (GWCC-12125) - untested path retained
 *  10/09/2021   svenkat      Merged from heritage branch (AGI-19238)
 *  03/12/2023   cdoyle       Merged from heritage branch (DEF-25838)
 *  19/10/2024   baldrid      Initial version for CHG-11626
 *  02/03/2025   kmbeki       Merged from heritage branch (AGI-14604)
 */
class AlbionActivityUtils {

  /**
   * Raises an activity for the bean from the ActivityPattern with the given code, in the bean's bundle.
   * Returns null (and raises nothing) when the bean is null or no pattern with that code is configured.
   */
  public static function raiseActivity(bean : KeyableBean, patternCode : String, subject : String) : Activity {
    if (bean == null or patternCode == null) {
      return null
    }
    var pattern = Query.make(ActivityPattern).compare(ActivityPattern#Code, Relop.Equals, patternCode).select().AtMostOneRow
    if (pattern == null) {
      return null
    }
    var activity = new Activity(bean.Bundle)
    activity.ActivityPattern = pattern
    activity.Subject = subject
    activity.Description = subject + " [" + bean.IntrinsicType.RelativeName + " " + bean.PublicID + "]"
    return activity
  }

  private construct() {}
}
