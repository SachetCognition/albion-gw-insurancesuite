package albion.integration.mid

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 60: Motor Insurance Database (MIB) vehicle feed. Spools each message to the MID feed.
 */
class MidTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "MID"

  override property get Feed() : String {
    return FEED
  }

  /** MidRecordBuilder record for the message's root entity; the payload when the root is not an entity. */
  override function buildRecord(message : Message, transformedPayload : String) : String {
    var root = message.MessageRoot
    if (root typeis KeyableBean) {
      return MidRecordBuilder.buildRecord(root)
    }
    return super.buildRecord(message, transformedPayload)
  }
}
