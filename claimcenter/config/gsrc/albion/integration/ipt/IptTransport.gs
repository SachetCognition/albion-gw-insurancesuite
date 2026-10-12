package albion.integration.ipt

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 67 (Insurance Premium Tax calculation & HMRC returns): builds the IptRecordBuilder fixed-width record from the message root and writes it to the IPT spool.
 */
class IptTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "IPT"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return albion.integration.ipt.IptRecordBuilder.buildRecord(message.MessageRoot as KeyableBean)
  }
}
