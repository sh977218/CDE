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
        clickElement(By.xpath("//div[@id='moveDown-0']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='key_1']")).getText().contains("cde for test cde reorder detail tabs"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='key_1']")).getText().contains("cde for test cde reorder detail tabs 2"));
        clickElement(By.xpath("//div[@id='moveTop-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='key_0']")).getText().contains("cde for test cde reorder detail tabs"));
    }

}
