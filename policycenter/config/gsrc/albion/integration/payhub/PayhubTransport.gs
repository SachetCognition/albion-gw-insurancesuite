package albion.integration.payhub

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the Group Payment Hub (BACS/Direct Debit/Faster Payments) interface (destination 69). */
class PayhubTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "PAYHUB"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
