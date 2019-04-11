package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReorderPermissibleValueTest extends NlmCdeBaseTest {

    @Test
    public void reorderPermissibleValue() {
        String cdeName = "Reorder permissible values cde";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        clickElement(By.id("moveDown-0"));
        textPresent("pv1", By.id("pvValue_1"));
        clickElement(By.id("moveUp-2"));
        textPresent("pv3", By.id("pvValue_1"));
        clickElement(By.id("moveTop-1"));
        textPresent("pv3", By.id("pvValue_0"));
    }
}
