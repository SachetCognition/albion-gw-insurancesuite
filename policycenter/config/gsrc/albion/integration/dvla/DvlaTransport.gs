package albion.integration.dvla

uses albion.integration.common.AlbionSpoolTransport

/** Message transport for the DVLA MyLicence ADD/DDS lookup interface (destination 65). */
class DvlaTransport extends AlbionSpoolTransport {

  public static final var SYSTEM_CODE : String = "DVLA"

  override property get SystemCode() : String {
    return SYSTEM_CODE
  }
}
