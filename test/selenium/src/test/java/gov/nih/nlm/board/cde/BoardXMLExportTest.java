package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardXMLExportTest  extends BoardTest {

    @Test
    public void boardXMLExport() {
        mustBeLoggedInAs(classifyBoardUser_username, password);
        goToBoard("Classify Board");
        textPresent("Export Board");
        clickElement(By.id(("export")));
        String url = findElement(By.id("xmlExport")).getAttribute("href");

        System.out.println("BoardXMLExportTest driver.get");
        System.out.println(url);
        driver.get(url);
        System.out.println("BoardXMLExportTest Assert");

        Assert.assertTrue(driver.getPageSource().contains("<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>"));

        System.out.println("BoardXMLExportTest Done");

    }

}
