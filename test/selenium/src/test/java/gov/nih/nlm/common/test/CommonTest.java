package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;


public abstract class CommonTest extends NlmCdeBaseTest {
    public void goToEltByName(String name) {
        goToEltByName(name, null);
    }

    public abstract void goToEltByName(String name, String status);

    public abstract void goToEltSearch();

    protected void reorderIconTest(String tabName) {
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-0" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-0" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-0" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-0" + postfix)).size(), 0);

        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-1" + postfix)).size(), 1);

        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-2" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-2" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-2" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-2" + postfix)).size(), 1);
    }
}
