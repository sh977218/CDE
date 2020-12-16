package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderPropertiesTest extends NlmCdeBaseTest {
    @Test
    public void cdeReorderProperties() {
        String cdeName = "Reorder properties cde";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        goToProperties();
        reorderBySection("properties", "down", 0);
        textPresent("pk1", By.cssSelector("[itemprop='key_1']"));
        reorderBySection("properties", "up", 2);
        textPresent("pk3", By.cssSelector("[itemprop='key_1']"));
        reorderBySection("properties", "top", 2);
        textPresent("pk1", By.cssSelector("[itemprop='key_0']"));
    }

}
