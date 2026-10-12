package albion.integration.ipt

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 67: Insurance Premium Tax calculation & HMRC returns. Spools each message to the IPT feed.
 */
class IptTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "IPT"

  override property get Feed() : String {
    return FEED
  }
}
