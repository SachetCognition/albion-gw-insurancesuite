package albion.integration.ipt

uses albion.integration.common.BrandMappingService
uses albion.integration.shadow.FixedWidthRecordWriter

/**
 * Candidate IPT record builder for the strangler shadow run: the IptRecordBuilder layout expressed as a field list on
 * FixedWidthRecordWriter. It is never authoritative; ShadowRecordFacade runs it only when shadow running is enabled for
 * the IPT feed, compares its output with IptRecordBuilder and returns the IptRecordBuilder record. It reads the same fields in the
 * same order and keeps every production quirk (silent truncation, trailing overpunch, 999999 brand default), so any
 * shadow difference is a real defect in the candidate.
 */
class IptRecordBuilderCandidate {

  static final var RECORD_LENGTH : int = 512

  private construct() {
  }

  static function buildRecord(src : KeyableBean) : String {
    return new FixedWidthRecordWriter("IPT", RECORD_LENGTH)
        .literal("IP89", 4)
        .text(src.getFieldValue("ERNRef_Ext"), 20)
        .text(src.getFieldValue("PolicyNumber_Ext"), 30)
        .number(src.getFieldValue("NINumber_Ext"), 11)
        .date(src.getFieldValue("VehicleVRM_Ext"), "yyyyMMdd")
        .literal(BrandMappingService.brandMap(src), 6)
        .build()
  }
}
