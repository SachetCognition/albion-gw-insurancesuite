package albion.integration.sanctions

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the HMT/OFSI sanctions and PEP screening via WorldCheck interface (destination 64). */
class SanctionsTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "SANCTIONS"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
