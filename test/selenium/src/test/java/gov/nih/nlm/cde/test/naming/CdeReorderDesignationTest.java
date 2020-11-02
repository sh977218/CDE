package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderDesignationTest extends NlmCdeBaseTest {

    @Test
    public void cdeReorderDesignationTest() {
        String cdeName = "Reorder designations cde";
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);

        goToCdeByName(cdeName);
        goToNaming();

        clickElement(By.id("moveDown-0"));
        textPresent("Reorder designations cde", By.cssSelector("[itemprop='designation_1']"));
        clickElement(By.id("moveUp-2"));
        textPresent("Another designation.",By.cssSelector("[itemprop='designation_1']"));
        clickElement(By.id("moveTop-2"));
        textPresent("Reorder designations cde", By.cssSelector("[itemprop='designation_0']"));
    }

}
