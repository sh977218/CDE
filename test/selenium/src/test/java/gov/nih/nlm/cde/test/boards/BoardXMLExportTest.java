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
            //findElement(By.id("xmlExport")).click();
          //  switchTab(1);
            String url = findElement(By.id("xmlExport")).getAttribute("href");
            String response = get(url).asString();
            System.out.println(response);
            Assert.assertTrue(response.length() > 0);
        }

}
