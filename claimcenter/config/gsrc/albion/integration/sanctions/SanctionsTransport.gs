package albion.integration.sanctions

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 64 (HMT/OFSI sanctions & PEP screening via WorldCheck): builds the SanctionsRecordBuilder fixed-width record from the message root and writes it to the SANCTIONS spool.
 */
class SanctionsTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "SANCTIONS"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return albion.integration.sanctions.SanctionsRecordBuilder.buildRecord(message.MessageRoot as KeyableBean)
  }
}
