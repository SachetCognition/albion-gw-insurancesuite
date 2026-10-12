package albion.integration.common

uses gw.plugin.messaging.MessageTransport

/**
 * Base message transport for the Albion flat-file feeds. Writes one record per message to the feed's outbound
 * spool via FlatFileSpooler and acknowledges the message; a spool failure is reported as a retryable error so
 * the destination's retry interval applies.
 */
abstract class AlbionSpoolTransport implements MessageTransport {

  private var _destinationId : int

  abstract property get FeedName() : String

  property get DestinationID() : int {
    return _destinationId
  }

  protected function recordFor(message : Message, transformedPayload : String) : String {
    return transformedPayload
  }

  override function send(message : Message, transformedPayload : String) {
    try {
      FlatFileSpooler.spool(FeedName, recordFor(message, transformedPayload))
    } catch (e : java.io.IOException) {
      print(FeedName + " transport: spool failed for message " + message.ID + " : " + e.Message)
      message.reportError()
      return
    }
    message.reportAck()
  }

  override function shutdown() {
  }

  override function suspend() {
  }

  override function resume() {
  }

  override function setDestinationID(destinationID : int) {
    _destinationId = destinationID
  }
}
