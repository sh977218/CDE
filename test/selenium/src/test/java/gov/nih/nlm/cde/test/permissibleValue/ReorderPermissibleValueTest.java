package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReorderPermissibleValueTest extends NlmCdeBaseTest {

    @Test
    public void reorderPermissibleValue() {
        String cdeName = "cde for test cde reorder detail tabs";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("moveDown-0"));
        textPresent("pv1", By.id("pvValue_1"));
        clickElement(By.id("moveUp-2"));
        textPresent("pv3", By.id("pvValue_1"));
        clickElement(By.id("moveTop-1"));
        textPresent("pv3", By.id("pvValue_0"));
    }
}
