package albion.integration.dvla

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 65 (DVLA MyLicence ADD/DDS lookup): spools the transformed payload unchanged and writes it to the DVLA spool.
 */
class DvlaTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "DVLA"

  override property get FeedName() : String {
    return FEED
  }
}
