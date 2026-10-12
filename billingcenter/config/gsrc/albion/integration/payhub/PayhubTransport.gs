package albion.integration.payhub

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 69: Group Payment Hub (BACS/Direct Debit/Faster Payments). Spools each message to the PAYHUB feed.
 */
class PayhubTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "PAYHUB"

  override property get Feed() : String {
    return FEED
  }
}
