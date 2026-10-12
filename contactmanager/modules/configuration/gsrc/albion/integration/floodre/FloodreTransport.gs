package albion.integration.floodre

uses albion.integration.common.AlbionSpoolTransport

/** Flood Re cession & bordereaux transport (messaging destination 63): spools the transformed payload (no CM record builder for this feed). */
class FloodreTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "FLOODRE"
  }
}
