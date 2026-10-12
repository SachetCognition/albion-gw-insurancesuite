package albion.integration.ipt

uses albion.integration.common.AlbionSpoolTransport

/** Insurance Premium Tax calculation & HMRC returns transport (messaging destination 67): builds the record with IptRecordBuilderV2. */
class IptTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "IPT"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.ipt.IptRecordBuilderV2.buildRecord(root)
  }
}
