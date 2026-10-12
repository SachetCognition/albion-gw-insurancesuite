package albion.integration.ipt

uses albion.integration.common.AlbionSpoolTransport
uses albion.integration.shadow.ShadowRecordFacade

/**
 * Message transport for destination 67 (Insurance Premium Tax calculation & HMRC returns): builds the IptRecordBuilder fixed-width record from the message root and writes it to the IPT spool.
 * The record is produced through ShadowRecordFacade, which shadow-runs IptRecordBuilderCandidate only when enabled for the IPT feed.
 */
class IptTransport extends AlbionSpoolTransport {

  public static final var FEED : String = "IPT"

  override property get FeedName() : String {
    return FEED
  }

  override protected function recordFor(message : Message, transformedPayload : String) : String {
    return ShadowRecordFacade.buildRecord(FEED, message.MessageRoot as KeyableBean,
        \ root -> IptRecordBuilder.buildRecord(root), \ root -> IptRecordBuilderCandidate.buildRecord(root))
  }
}
