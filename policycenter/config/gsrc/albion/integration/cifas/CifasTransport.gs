package albion.integration.cifas

uses albion.integration.common.AlbionSpoolTransport
uses albion.integration.cifas.CifasRecordBuilderV2

/** Message transport for the CIFAS fraud database interface (destination 66). */
class CifasTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "CIFAS"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }

  /** Builds the fixed-width record with CifasRecordBuilderV2 when the message carries no transformed payload. */
  override protected function recordFor(message : Message, transformedPayload : String) : String {
    if ((transformedPayload == null or transformedPayload.Empty) and message.MessageRoot typeis KeyableBean) {
      return CifasRecordBuilderV2.buildRecord(message.MessageRoot)
    }
    return transformedPayload
  }
}
