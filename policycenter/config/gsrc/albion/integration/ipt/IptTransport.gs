package albion.integration.ipt

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Insurance Premium Tax calculation and HMRC returns interface (destination 67). */
class IptTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "IPT"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
