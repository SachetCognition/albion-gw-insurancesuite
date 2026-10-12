package albion.integration.cue

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Claims and Underwriting Exchange enquiry/load interface (destination 61). */
class CueTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "CUE"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
