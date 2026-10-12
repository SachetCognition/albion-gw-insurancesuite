package albion.integration.polaris_mf

uses albion.integration.common.BrandMappingService
uses albion.integration.shadow.FixedWidthRecordWriter

/**
 * Candidate POLARIS_MF record builder for the strangler shadow run: the PolarisMfRecordBuilderV2 layout expressed as a field list on
 * FixedWidthRecordWriter. It is never authoritative; ShadowRecordFacade runs it only when shadow running is enabled for
 * the POLARIS_MF feed, compares its output with PolarisMfRecordBuilderV2 and returns the PolarisMfRecordBuilderV2 record. It reads the same fields in the
 * same order and keeps every production quirk (silent truncation, trailing overpunch, 999999 brand default), so any
 * shadow difference is a real defect in the candidate.
 */
class PolarisMfRecordBuilderCandidate {

  static final var RECORD_LENGTH : int = 512

  private construct() {
  }

  static function buildRecord(src : KeyableBean) : String {
    return new FixedWidthRecordWriter("POLARIS_MF", RECORD_LENGTH)
        .literal("PO92", 4)
        .text(src.getFieldValue("VehicleVRM_Ext"), 15)
        .text(src.getFieldValue("InceptionDate_Ext"), 30)
        .number(src.getFieldValue("RiskPostcode_Ext"), 11)
        .date(src.getFieldValue("InsuredSurname_Ext"), "yyyyMMdd")
        .literal(BrandMappingService.brandMap(src), 6)
        .build()
  }
}
