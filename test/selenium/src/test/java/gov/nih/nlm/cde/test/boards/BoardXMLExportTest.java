package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;


public class BoardXMLExportTest  extends BoardTest {

    @Test
    public void boardXMLExport() {
            mustBeLoggedInAs(classifyBoardUser_username, password);
            goToBoard("Classify Board");
            textPresent("Export Board");
            clickElement(By.id("export"));
            new Select(driver.findElement(By.name("export"))).selectByVisibleText("xmlExport");
            String url = findElement(By.id("xmlExport")).getAttribute("href");
            String response = get(url).asString();
            Assert.assertTrue(response.contains("<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("</elements>\n" + "<name>Domain</name>"));
            Assert.assertTrue(response.contains("<primaryDefinitionCopy>\n" + "Date (and time, if applicable and known) the Manual Muscle Testing (MMT) was performed\n" + "</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("<source>NINDS Variable Name</source>\n"));
            Assert.assertTrue(response.contains("<primaryDefinitionCopy>\n" + "Indicator how often the subject feels irritable or has angry outbursts as part of PTSD Checklist Military (PCLM).\n" + "</primaryDefinitionCopy>"));
            Assert.assertTrue(response.contains("<changeNote>Bulk update from source</changeNote>"));
            findElement(By.id("xmlExport")).click();
            switchTab(1);
            switchTabAndClose(0);

    }
}
