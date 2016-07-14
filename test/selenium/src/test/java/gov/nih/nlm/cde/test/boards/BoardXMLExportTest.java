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

        switchTab(1);
        Assert.assertTrue(driver.getPageSource().contains("<primaryDefinitionCopy>Name of pathologist who diagnosed the case</primaryDefinitionCopy>"));

        switchTabAndClose(0);
    }

}
