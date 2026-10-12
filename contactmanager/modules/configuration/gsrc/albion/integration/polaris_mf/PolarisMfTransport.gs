package albion.integration.polaris_mf

uses albion.integration.common.AlbionSpoolTransport

/** POLARIS mainframe policy admin (heritage book) nightly sync transport (messaging destination 68): builds the record with PolarisMfRecordBuilder. */
class PolarisMfTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "POLARIS_MF"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.polaris_mf.PolarisMfRecordBuilder.buildRecord(root)
  }
}
