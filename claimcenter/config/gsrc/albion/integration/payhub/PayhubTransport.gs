package albion.integration.payhub

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 69 (Group Payment Hub (BACS/Direct Debit/Faster Payments)): builds the PayhubRecordBuilderV3 fixed-width record from the message root and writes it to the PAYHUB spool.
 */
class PayhubTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "PAYHUB"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return albion.integration.payhub.PayhubRecordBuilderV3.buildRecord(message.MessageRoot as KeyableBean)
  }
}
