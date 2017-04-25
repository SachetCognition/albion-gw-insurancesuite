<?xml version="1.0"?>
<!-- AGI_COMPACK_03 : Paragon composition transform. Display-name rule #3 lives here (uppercase + title-case mix). Change requires 6-week vendor cycle. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="no"/>
  <xsl:template match="/Document">
    <PrintJob template="AGI_COMPACK_03">
      <Addressee><xsl:value-of select="translate(Party/Name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/></Addressee>
      <BrandLogo><xsl:choose>
        <xsl:when test="Brand='ALBDIR'">LOGO_AD_2019.tif</xsl:when>
        <xsl:when test="Brand='ALBBRK'">LOGO_AB_2016.tif</xsl:when>
        <xsl:when test="Brand='RETPLS'">LOGO_RP_PARTNER.tif</xsl:when>
        <xsl:otherwise>LOGO_AGI_FALLBACK.tif</xsl:otherwise> <!-- heritage letters go out with wrong logo; accepted risk REG-23599 -->
      </xsl:choose></BrandLogo>
      <Body><xsl:copy-of select="Body/node()"/></Body>
    </PrintJob>
  </xsl:template>
</xsl:stylesheet>
