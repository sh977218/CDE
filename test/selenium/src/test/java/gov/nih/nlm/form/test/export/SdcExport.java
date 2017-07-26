package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class SdcExport extends NlmCdeBaseTest {

    @Test
    public void sdcXmlExport() {
        String url = baseUrl + "/form/XySUBn_NZ/xml/sdc/";
        System.out.println("url: " + url);
        String response = get(url).asString();
        System.out.println("response: " + response);
        Assert.assertFalse(response.contains("<!-- Validation Error: Error:"));
        Assert.assertTrue(response.contains("<FormDesign xmlns=\"http://healthIT.gov/sdc\""));
        Assert.assertTrue(response.contains("<Section ID"));
        Assert.assertTrue(response.contains("title=\"CLINICAL\">"));
        Assert.assertTrue(response.contains("<ListItem ID="));
        Assert.assertTrue(response.contains("title=\"Intact\"/>"));
        Assert.assertTrue(response.contains("<Question ID=\"XyEbt94V_\" title=\"Additional Dimension\">"));
    }

    @Test
    public void sdcXmlExportLoinc() {
        String response = get(baseUrl + "/form/Xyo4O4BIM/xml/sdc/").asString();
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

}
