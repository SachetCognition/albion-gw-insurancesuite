package albion.integration.mid

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Motor Insurance Database (MIB) vehicle feed interface (destination 60). */
class MidTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "MID"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
