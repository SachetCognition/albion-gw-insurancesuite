package albion.integration.floodre

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 63: Flood Re cession & bordereaux. Spools each message to the FLOODRE feed.
 */
class FloodreTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "FLOODRE"

  override property get Feed() : String {
    return FEED
  }

  /** FloodreRecordBuilder record for the message's root entity; the payload when the root is not an entity. */
  override function buildRecord(message : Message, transformedPayload : String) : String {
    var root = message.MessageRoot
    if (root typeis KeyableBean) {
      return FloodreRecordBuilder.buildRecord(root)
    }
    return super.buildRecord(message, transformedPayload)
  }
}
