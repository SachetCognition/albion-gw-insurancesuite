package albion.integration.polaris_mf

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 68 (POLARIS mainframe policy admin (heritage book) nightly sync): builds the PolarisPartyRecordBuilder fixed-width record from the message root and writes it to the POLARIS spool.
 */
class PolarisMfTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "POLARIS"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(message.MessageRoot as KeyableBean)
  }
}
