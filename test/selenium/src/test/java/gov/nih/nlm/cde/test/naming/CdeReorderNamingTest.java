package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeReorderNamingTest extends NlmCdeBaseTest {

    @Test
    public void cdeReorderNamingTest() {
        String cdeName = "cde for test cde reorder detail tabs";

        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);

        goToCdeByName(cdeName);
        goToNaming();
        clickElement(By.id("moveDown-0"));
        Assert.assertTrue(findElement(By.id("designation_1")).getText().contains("cde for test cde reorder detail tabs"));
        clickElement(By.id("moveUp-2"));
        Assert.assertTrue(findElement(By.id("designation_1")).getText().contains("cde for test cde reorder detail tabs 2"));
        clickElement(By.id("moveTop-2"));
        Assert.assertTrue(findElement(By.id("designation_0")).getText().contains("cde for test cde reorder detail tabs"));
    }

}
