package albion.integration.elto

uses albion.integration.common.AlbionSpoolTransport

/** Employers Liability Tracing Office ELD feed transport (messaging destination 62): spools the transformed payload (no CM record builder for this feed). */
class EltoTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "ELTO"
  }
}
