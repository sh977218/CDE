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

        reorderBySection("permissible-value", "down", 0);
        textPresent("pv1", By.id("pvValue_1"));
        reorderBySection("permissible-value", "up", 2);
        textPresent("pv3", By.id("pvValue_1"));
        reorderBySection("permissible-value", "top", 1);
        textPresent("pv3", By.id("pvValue_0"));
    }
}
