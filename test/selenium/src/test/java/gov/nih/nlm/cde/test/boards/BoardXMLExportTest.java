package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;


public class BoardXMLExportTest  extends BoardTest {

    @Test
    public void boardXMLExport() {
            mustBeLoggedInAs(classifyBoardUser_username, password);
            goToBoard("Test Pinning Board");
            textPresent("Export Board");
            clickElement(By.id("export"));
            findElement(By.id("xmlExport")).click();
            String url = findElement(By.id("xmlExport")).getAttribute("href");
            String response = get(url).asString();
            Assert.assertTrue(response.contains("<primaryDefinitionCopy>\n" + "Ethnicity the participant/subject's mother most closely identifies with\n" + "</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("<name>Multisite Research Study</name>"));
            Assert.assertTrue(response.contains("<primaryDefinitionCopy> The text for reporting information about ethnicity based on the Office of Management and Budget (OMB) categories.</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("<name>GBC Group Banking Committee</name>"));
            Assert.assertTrue(response.contains("<primaryDefinitionCopy>\n" + "Indicator of whether the participant/subject used the specific type of medication affecting cardiovascular functions on the day of the examination\n" + "</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("<name>Disease</name>"));
            findElement(By.id("xmlExport")).click();
            switchTab(1);
            switchTabAndClose(0);

    }
}
