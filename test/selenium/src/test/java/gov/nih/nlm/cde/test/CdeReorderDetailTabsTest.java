package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeReorderDetailTabsTest extends NlmCdeBaseTest {
    @Test
    public void CdeReorderDetailTabs() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "cde for test cde reorder detail tabs";
        goToCdeByName(cdeName);
        testPermissible();
        findElement(By.linkText("Naming")).click();
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Reference Documents")).click();
        findElement(By.linkText("Properties")).click();
    }

    private void testPermissible() {
        findElement(By.linkText("Permissible Values")).click();
        textPresent("cs3");
        Assert.assertEquals(driver.findElements(By.id("moveUp-0")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveTop-0")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveDown-0")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveBottom-0")).size(), 1);

        Assert.assertEquals(driver.findElements(By.id("moveUp-1")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveTop-1")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveDown-1")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveBottom-1")).size(), 1);

        Assert.assertEquals(driver.findElements(By.id("moveUp-2")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveTop-2")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveDown-2")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveBottom-2")).size(), 0);

        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("pv-1")).getText().contains("pv1 Confirm Discard"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("pv-2")).getText().contains("pv2 Confirm Discard"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("pv-1")).getText().contains("pv2 Confirm Discard"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("pv-0")).getText().contains("pv3 Confirm Discard"));
        textPresent("");
    }
}
