package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class DynamicCodeListDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void dynamicCodeLisDatatype() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        String datatype = "Dynamic Code List";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        changeDatatype(datatype);
        new Select(findElement(By.id("dynamicListSystem"))).selectByVisibleText("VSAC");
        findElement(By.id("dynamicListCode")).sendKeys("some OID");

        goToCdeByName(cdeName);
        goToPermissibleValues();
        textPresent("some OID");

        goToHistory();
        selectHistoryAndCompare(1, 2);
    }

}