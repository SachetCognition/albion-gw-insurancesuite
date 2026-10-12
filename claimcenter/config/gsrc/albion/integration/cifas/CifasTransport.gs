package albion.integration.cifas

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 66 (CIFAS fraud database): spools the transformed payload unchanged and writes it to the CIFAS spool.
 */
class CifasTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "CIFAS"

  override property get FeedName() : String {
    return FEED
  }
}
