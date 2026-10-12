package albion.integration.common

uses gw.plugin.messaging.MessageTransport
uses java.util.Map

/**
 * Base messaging transport for the Albion outbound feeds: builds the feed record for the message root
 * and appends it to the feed's spool file via FlatFileSpooler, then acknowledges the message.
 * Errors are reported back to the messaging engine so the destination's retry interval applies.
 */
abstract class AlbionSpoolTransport implements MessageTransport {

  var _destinationId : int
  var _suspended : boolean

  /** Spool file name for the feed, e.g. "CUE". */
  abstract property get FeedName() : String

  /** Record to spool; defaults to the transformed payload when the feed has no record builder. */
  protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return transformedPayload
  }

  override function send(msg : Message, transformedPayload : String) {
    try {
      var root = msg.MessageRoot as KeyableBean
      FlatFileSpooler.spool(FeedName, buildRecord(root, transformedPayload))
      msg.reportAck()
    } catch (e : java.lang.Exception) {
      msg.reportError()
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

  property get Suspended() : boolean {
    return _suspended
  }

  override property set DestinationID(destinationId : int) {
    _destinationId = destinationId
  }

  property get DestinationID() : int {
    return _destinationId
  }

  property set Parameters(params : Map<Object, Object>) {
  }
}
