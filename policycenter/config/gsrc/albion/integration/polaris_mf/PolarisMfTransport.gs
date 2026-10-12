package albion.integration.polaris_mf

uses albion.integration.common.AlbionSpoolTransport
uses albion.integration.polaris_mf.PolarisMfRecordBuilderV2

/** Message transport for the POLARIS mainframe policy admin (heritage book) nightly sync interface (destination 68). */
class PolarisMfTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "POLARIS_MF"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }

  /** Builds the fixed-width record with PolarisMfRecordBuilderV2 when the message carries no transformed payload. */
  override protected function recordFor(message : Message, transformedPayload : String) : String {
    if ((transformedPayload == null or transformedPayload.Empty) and message.MessageRoot typeis KeyableBean) {
      return PolarisMfRecordBuilderV2.buildRecord(message.MessageRoot)
    }
    return transformedPayload
  }
}
