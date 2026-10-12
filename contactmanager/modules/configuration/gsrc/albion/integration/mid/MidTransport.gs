package albion.integration.mid

uses albion.integration.common.AlbionSpoolTransport

/** Motor Insurance Database (MIB) vehicle feed transport (messaging destination 60): spools the transformed payload (no CM record builder for this feed). */
class MidTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "MID"
  }
}
