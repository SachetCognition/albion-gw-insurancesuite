package albion.integration.cue

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 61 (Claims & Underwriting Exchange enquiry/load): spools the transformed payload unchanged and writes it to the CUE spool.
 */
class CueTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "CUE"

  override property get FeedName() : String {
    return FEED
  }
}
