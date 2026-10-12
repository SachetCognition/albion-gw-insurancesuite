package albion.enhancements

/**
 * Typed accessors for ScriptParameters.xml entries read by preupdate rules.
 */
enhancement AlbionScriptParametersEnhancement : ScriptParameters {

  static property get RecordInHistory_ChangesToAssignedUser() : Boolean {
    return ScriptParameters.getParameterValue("RecordInHistory_ChangesToAssignedUser") as Boolean
  }
}
