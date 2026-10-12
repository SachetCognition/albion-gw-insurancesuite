package albion.integration.sanctions

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 64: HMT/OFSI sanctions & PEP screening via WorldCheck. Spools each message to the SANCTIONS feed.
 */
class SanctionsTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "SANCTIONS"

  override property get Feed() : String {
    return FEED
  }
}
