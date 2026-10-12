package albion.integration.cue

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 61: Claims & Underwriting Exchange enquiry/load. Spools each message to the CUE feed.
 */
class CueTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "CUE"

  override property get Feed() : String {
    return FEED
  }
}
