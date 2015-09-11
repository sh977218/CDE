package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class PermissibleValueTest extends CommonTest {

    public void reorderPermissibleValueTest(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        String tabName = "permissibleValueDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Permissible Values")).click();
        textPresent("cs3");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-1" + postfix)).getText().contains("pv1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-2" + postfix)).getText().contains("pv2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-1" + postfix)).getText().contains("pv2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-0" + postfix)).getText().contains("pv3"));
    }
}
