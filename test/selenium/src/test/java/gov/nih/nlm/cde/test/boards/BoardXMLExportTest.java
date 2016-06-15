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
            clickElement(By.id(("export")));
            findElement(By.id("xmlExport")).click();
            switchTab(1);

//      String url = findElement(By.id("xmlExport")).getAttribute("href");
//            String response = get(url).asString();

            String[] expected = {
                    "<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>",
                    "</elements>\n<name>Domain</name>",
                    "<primaryDefinitionCopy>\nDate (and time, if applicable and known) the Manual Muscle Testing (MMT) was performed\n</primaryDefinitionCopy>",
                    "<source>NINDS Variable Name</source>",
                    "<primaryDefinitionCopy>\nIndicator how often the subject feels irritable or has angry outbursts as part of PTSD Checklist Military (PCLM).\n</primaryDefinitionCopy>",
                    "<changeNote>Bulk update from source</changeNote>"
            };
            for (String s : expected) {
//                    Assert.assertTrue(response.contains(s), "Cannot find: " + s + "-- Actual: " + response);
                    textPresent(s);
            }

            switchTabAndClose(0);
    }
}
