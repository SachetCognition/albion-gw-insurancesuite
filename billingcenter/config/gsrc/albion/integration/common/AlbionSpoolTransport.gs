package albion.integration.common

uses gw.plugin.messaging.MessageTransport

/**
 * Base MessageTransport for the Albion outbound destinations: each message is written as one record to the
 * destination's flat-file spool (FlatFileSpooler), which the Control-M file-transfer jobs deliver. The message
 * is acknowledged once the record is spooled and reported as an error (retried by the destination) otherwise.
 */
abstract class AlbionSpoolTransport implements MessageTransport {

  var _destinationId : int
  var _suspended : boolean

  /** Spool feed name, e.g. MID. */
  abstract property get Feed() : String

  property get DestinationID() : int {
    return _destinationId
  }

  property get Suspended() : boolean {
    return _suspended
  }

  /** Record to spool: the transformed payload when present, otherwise the raw message payload. */
  function buildRecord(message : Message, transformedPayload : String) : String {
    return transformedPayload ?: message.Payload
  }

  override function send(message : Message, transformedPayload : String) {
    try {
      FlatFileSpooler.spool(Feed, buildRecord(message, transformedPayload))
      message.reportAck()
    } catch (e : java.lang.Exception) {
      print(typeof(this).RelativeName + ": spool failed for message " + message.ID + " : " + e.Message)
      message.reportError()
    }
  }

  override function shutdown() {
  }

  override function suspend() {
    _suspended = true
  }

  override function resume() {
    _suspended = false
  }

  override function setDestinationID(id : int) {
    _destinationId = id
  }
}
