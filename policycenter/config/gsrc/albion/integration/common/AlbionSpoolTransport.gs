package albion.integration.common

uses gw.plugin.messaging.MessageTransport
uses java.io.File

/**
 * Base message transport for the Albion file-based interfaces: each message is written as one record to the
 * interface's outbound spool file (FlatFileSpooler) and acknowledged. Subclasses name the interface and may
 * build the record from the message root when the payload is empty.
 */
abstract class AlbionSpoolTransport implements MessageTransport {

  var _destinationId : int

  abstract property get SystemCode() : String

  property get DestinationId() : int {
    return _destinationId
  }

  protected property get SpoolDirectory() : File {
    return FlatFileSpooler.SpoolDirectory
  }

  protected function recordFor(message : Message, transformedPayload : String) : String {
    return transformedPayload
  }

  override function send(message : Message, transformedPayload : String) {
    FlatFileSpooler.spool(SpoolDirectory, SystemCode, recordFor(message, transformedPayload))
    message.reportAck()
  }

  override function shutdown() {
  }

  override function suspend() {
  }

  override function resume() {
  }

  override function setDestinationID(id : int) {
    _destinationId = id
  }
}
