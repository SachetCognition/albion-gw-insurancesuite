package albion.integration.cue

uses albion.integration.common.AlbionSpoolTransport

/** Claims & Underwriting Exchange enquiry/load transport (messaging destination 61): builds the record with CueRecordBuilder. */
class CueTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "CUE"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.cue.CueRecordBuilder.buildRecord(root)
  }
}
