package albion.integration.elto

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 62: Employers Liability Tracing Office ELD feed. Spools each message to the ELTO feed.
 */
class EltoTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "ELTO"

  override property get Feed() : String {
    return FEED
  }
}
