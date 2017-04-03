package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeReorderPropertiesTest extends NlmCdeBaseTest {
    @Test
    public void cdeReorderPropertiesTest() {
        String cdeName = "cde for test cde reorder detail tabs";

        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("properties_tab"));
        clickElement(By.id("moveDown-0"));
        Assert.assertTrue(findElement(By.id("key_1")).getText().contains("pk1"));
        clickElement(By.id("moveUp-2"));
        Assert.assertTrue(findElement(By.id("key_1")).getText().contains("pk3"));
        clickElement(By.id("moveTop-2"));
        Assert.assertTrue(findElement(By.id("key_0")).getText().contains("pk1"));
    }

}
