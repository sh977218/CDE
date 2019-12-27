package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class CdeExportXmlTest extends NlmCdeBaseTest {
    @Test
    public void cdeExportXml() {
        String cdeName = "Patient Gender Code";
        goToCdeByName(cdeName);
        findElement(By.id("export")).click();
        String url = findElement(By.id("xmlExport")).getAttribute("href");
        String response = get(url).asString();
        Assert.assertTrue(response.contains("<designation>Patient Gender Code</designation>"));
        Assert.assertTrue(response.contains("<definition>" +
                "the coded CDUS values for classification of the sex or gender role of the patient/participant.(CDUS Exchange)" +
                "</definition>"));
        Assert.assertTrue(response.contains("<tinyId>bzGjaFPtQCs</tinyId>"));
        findElement(By.id("xmlExport")).click();
        switchTab(1);
        switchTabAndClose(0);
    }

    @Test
    public void cdeAsXml() {
        String response = get(baseUrl + "/api/de/V2kBmnrd9MH?type=xml").asString();
        Assert.assertTrue(response.contains("<valueMeaningName>Very mild</valueMeaningName>"));

        response = get(baseUrl + "/api/de/my1gxMuW_hdl/version/1").asString();
        Assert.assertTrue(response.contains("Patient does not respond to external"));

        response = get(baseUrl + "/server/de/originalSource/caDSR/m10MsOXkJg").asString();
        Assert.assertTrue(response.contains("No caDSR source file found for m10MsOXkJg"));

    }


}
