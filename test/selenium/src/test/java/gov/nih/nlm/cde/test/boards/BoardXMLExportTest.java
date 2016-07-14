package gov.nih.nlm.cde.test.boards;

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
        clickElement(By.id("xmlExport"));

        System.out.println("before switch tab");

        switchTab(1);
        System.out.println("after switch tab");

        Assert.assertTrue(driver.getPageSource().contains("<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>"));

        System.out.println("before close tab");
        switchTabAndClose(0);
        System.out.println("after close tab");

    }

}
