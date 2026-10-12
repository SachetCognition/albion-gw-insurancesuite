package albion.integration.mid

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 60 (Motor Insurance Database (MIB) vehicle feed): spools the transformed payload unchanged and writes it to the MID spool.
 */
class MidTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "MID"

  override property get FeedName() : String {
    return FEED
  }
}
