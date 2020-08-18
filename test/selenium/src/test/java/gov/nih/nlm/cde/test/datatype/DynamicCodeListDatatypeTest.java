package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
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
        clickElement(By.id("dynamicListSystem"));
        selectMatSelectDropdownByText("VSAC");
        findElement(By.id("dynamicListCode")).sendKeys("some OID");
        wait.until(ExpectedConditions.attributeToBe(By.id("dynamicListCode"), "value", "some OID"));

        goToCdeByName(cdeName);
        goToPermissibleValues();
        Assert.assertEquals(findElement(By.id("dynamicListCode")).getAttribute("value"), "some OID");

        goToHistory();
        selectHistoryAndCompare(1, 2);
    }
}
