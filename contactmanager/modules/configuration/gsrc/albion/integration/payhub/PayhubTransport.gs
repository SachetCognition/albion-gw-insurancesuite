package albion.integration.payhub

uses albion.integration.common.AlbionSpoolTransport

/** Group Payment Hub (BACS/Direct Debit/Faster Payments) transport (messaging destination 69): builds the record with PayhubRecordBuilder. */
class PayhubTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "PAYHUB"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.payhub.PayhubRecordBuilder.buildRecord(root)
  }
}
