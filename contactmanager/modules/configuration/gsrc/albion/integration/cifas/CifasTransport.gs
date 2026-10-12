package albion.integration.cifas

uses albion.integration.common.AlbionSpoolTransport

/** CIFAS fraud database transport (messaging destination 66): builds the record with CifasRecordBuilder. */
class CifasTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "CIFAS"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return albion.integration.cifas.CifasRecordBuilder.buildRecord(root)
  }
}
