package albion.integration.elto

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Employers Liability Tracing Office ELD feed interface (destination 62). */
class EltoTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "ELTO"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
