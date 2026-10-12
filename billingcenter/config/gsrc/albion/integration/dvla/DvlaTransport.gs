package albion.integration.dvla

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 65: DVLA MyLicence ADD/DDS lookup. Spools each message to the DVLA feed.
 */
class DvlaTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "DVLA"

  override property get Feed() : String {
    return FEED
  }
}
