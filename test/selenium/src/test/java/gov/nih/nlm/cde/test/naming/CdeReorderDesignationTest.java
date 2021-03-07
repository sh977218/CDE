package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderDesignationTest extends NlmCdeBaseTest {

    @Test
    public void cdeReorderDesignationTest() {
        String cdeName = "Reorder designations cde";
        mustBeLoggedInAs(testAdmin_username, password);

        goToCdeByName(cdeName);
        goToNaming();

        reorderBySection("designations", "down", 0);
        textPresent("Reorder designations cde", By.cssSelector("[itemprop='designation_1']"));
        reorderBySection("designations", "up", 2);
        textPresent("Another designation.",By.cssSelector("[itemprop='designation_1']"));
        reorderBySection("designations", "top", 2);
        textPresent("Reorder designations cde", By.cssSelector("[itemprop='designation_0']"));
    }

}
