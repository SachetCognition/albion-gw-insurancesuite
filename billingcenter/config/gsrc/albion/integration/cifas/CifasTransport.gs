package albion.integration.cifas

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 66: CIFAS fraud database. Spools each message to the CIFAS feed.
 */
class CifasTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "CIFAS"

  override property get Feed() : String {
    return FEED
  }
}
