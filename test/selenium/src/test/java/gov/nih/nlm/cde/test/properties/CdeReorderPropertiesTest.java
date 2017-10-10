package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderPropertiesTest extends NlmCdeBaseTest {
    @Test
    public void cdeReorderProperties() {
        String cdeName = "cde for test cde reorder detail tabs";

        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("properties_tab"));
        clickElement(By.id("moveDown-0"));
        textPresent("pk1", By.id("key_1"));
        clickElement(By.id("moveUp-2"));
        textPresent("pk3", By.id("key_1"));
        clickElement(By.id("moveTop-2"));
        textPresent("pk1", By.id("key_0"));
    }

}
