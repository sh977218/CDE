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
        String url = findElement(By.id("xmlExport")).getAttribute("href");
        String response = get(url).asString();

        System.out.println("URL: " + url);
        System.out.println("REsponse: " + response);
//        findElement(By.id("xmlExport")).click();
//        switchTab(1);
//        textPresent( "<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>" );


//        System.out.println("parent source" + driver.getPageSource());

    //    Assert.assertTrue(driver.getPageSource().contains( "<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>" ));

//        switchTabAndClose(0);

    }

}
