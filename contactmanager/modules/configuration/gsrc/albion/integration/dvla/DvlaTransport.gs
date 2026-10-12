package albion.integration.dvla

uses albion.integration.common.AlbionSpoolTransport

/** DVLA MyLicence ADD/DDS lookup transport (messaging destination 65): builds the record with DvlaRecordBuilder. */
class DvlaTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "DVLA"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.dvla.DvlaRecordBuilder.buildRecord(root)
  }
}
