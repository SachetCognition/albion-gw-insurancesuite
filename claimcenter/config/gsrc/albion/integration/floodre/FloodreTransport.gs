package albion.integration.floodre

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 63 (Flood Re cession & bordereaux): spools the transformed payload unchanged and writes it to the FLOODRE spool.
 */
class FloodreTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "FLOODRE"

  override property get FeedName() : String {
    return FEED
  }
}
