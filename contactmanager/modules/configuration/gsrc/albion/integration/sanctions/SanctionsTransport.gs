package albion.integration.sanctions

uses albion.integration.common.AlbionSpoolTransport

/** HMT/OFSI sanctions & PEP screening via WorldCheck transport (messaging destination 64): spools the transformed payload (no CM record builder for this feed). */
class SanctionsTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "SANCTIONS"
  }
}
