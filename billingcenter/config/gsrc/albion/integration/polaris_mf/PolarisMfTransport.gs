package albion.integration.polaris_mf

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for messaging destination 68: POLARIS mainframe policy admin (heritage book) nightly sync. Spools each message to the POLARIS_MF feed.
 */
class PolarisMfTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "POLARIS_MF"

  override property get Feed() : String {
    return FEED
  }

  /** PolarisPartyRecordBuilder record for the message's root entity; the payload when the root is not an entity. */
  override function buildRecord(message : Message, transformedPayload : String) : String {
    var root = message.MessageRoot
    if (root typeis KeyableBean) {
      return albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(root)
    }
    return super.buildRecord(message, transformedPayload)
  }
}
