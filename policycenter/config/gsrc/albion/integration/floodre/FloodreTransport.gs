package albion.integration.floodre

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Flood Re cession and bordereaux interface (destination 63). */
class FloodreTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "FLOODRE"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
