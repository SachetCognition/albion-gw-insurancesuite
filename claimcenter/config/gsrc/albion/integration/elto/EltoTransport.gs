package albion.integration.elto

uses albion.integration.common.AlbionSpoolTransport

/**
 * Message transport for destination 62 (Employers Liability Tracing Office ELD feed): builds the EltoRecordBuilder fixed-width record from the message root and writes it to the ELTO spool.
 */
class EltoTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "ELTO"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return albion.integration.elto.EltoRecordBuilder.buildRecord(message.MessageRoot as KeyableBean)
  }
}
