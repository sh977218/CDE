package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class SdcExport extends NlmCdeBaseTest {

    @Test
    public void sdcXmlExport() {
        String url = baseUrl + "/server/form/form/XySUBn_NZ?type=xml&subtype=sdc";
        String response = get(url).asString();
        Assert.assertFalse(response.contains("<!-- Validation Error: Error:"), "response: " + response);
        Assert.assertTrue(response.contains("<FormDesign xmlns=\"urn:ihe:qrph:sdc:2016\""), "response: " + response);
        Assert.assertTrue(response.contains("<Section ID"), "response: " + response);
        Assert.assertTrue(response.contains("title=\"CLINICAL\">"), "response: " + response);
        Assert.assertTrue(response.contains("<ListItem ID="), "response: " + response);
        Assert.assertTrue(response.contains("title=\"Intact\""), "response: " + response);
        Assert.assertTrue(response.contains("<Question ID=\"XyEbt94V_\" title=\"Additional Dimension\">"), "response: " + response);
    }

    @Test
    public void sdcXmlValidation() {
        String url = baseUrl + "/server/form/form/XySUBn_NZ?type=xml&subtype=sdc&validate=true";
        String response = get(url).asString();
        Assert.assertFalse(response.contains("<!-- Validation Error: Error:"), "response: " + response);
        Assert.assertTrue(response.contains("<FormDesign xmlns=\"urn:ihe:qrph:sdc:2016\""), "response: " + response);
        Assert.assertTrue(response.contains("<Section ID"), "response: " + response);
        Assert.assertTrue(response.contains("title=\"CLINICAL\">"), "response: " + response);
        Assert.assertTrue(response.contains("<ListItem ID="), "response: " + response);
        Assert.assertTrue(response.contains("title=\"Intact\">"), "response: " + response);
        Assert.assertTrue(response.contains("<Question ID=\"XyEbt94V_\" title=\"Additional Dimension\">"), "response: " + response);
    }

    @Test
    public void sdcXmlExportLoinc() {
        String response = get(baseUrl + "/server/form/form/Xyo4O4BIM?type=xml&subtype=sdc").asString();
        Assert.assertTrue(response.contains("<CodedValue><Code val=\"LA15255-5\"/><CodeSystem><CodeSystemName val=\"LOINC\"/>"));
        Assert.assertTrue(response.contains("<CodeSystem><CodeSystemName val=\"LOINC\"/><Version val=\"2.1213\"/></CodeSystem>"));

    }

    @Test
    public void sdcRender() {
        mustBeLoggedInAs(reguser_username, password);
        goToFormByName("SDC Adrenal");
        clickElement(By.id("export"));
        clickElement(By.id("sdcHtmlExport"));
        switchTab(1);
        textPresent("Hormone production");
        textPresent("Additional dimensions (repeat");
        textPresent("Distance from Closest Margin");
        switchTabAndClose(0);
    }

    @Test
    public void sdcNoSection() {
        String url = baseUrl + "/server/form/form/Qkn8qzT3og?type=xml&subtype=sdc&validate=true";
        String response = get(url).asString();
        Assert.assertTrue(response.contains("SDC Export does not support questions outside of sections"), "actual: \n" + response);
    }

}
