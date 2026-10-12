package albion.integration.polaris_mf

uses albion.integration.common.AlbionSpoolTransport
uses albion.integration.shadow.ShadowRecordFacade

/** POLARIS mainframe policy admin (heritage book) nightly sync transport (messaging destination 68): builds the record with PolarisMfRecordBuilder
 * through ShadowRecordFacade, which shadow-runs PolarisMfRecordBuilderCandidate only when enabled for the POLARIS_MF feed. */
class PolarisMfTransport extends AlbionSpoolTransport {

  override property get FeedName() : String {
    return "POLARIS_MF"
  }

  override protected function buildRecord(root : KeyableBean, transformedPayload : String) : String {
    return ShadowRecordFacade.buildRecord(FeedName, root,
        \ bean -> PolarisMfRecordBuilder.buildRecord(bean), \ bean -> PolarisMfRecordBuilderCandidate.buildRecord(bean))
  }
}
