package gov.nih.nlm.common.test;

import org.openqa.selenium.By;

public abstract class PermissibleValueTest extends CommonTest {

    public void reorderPermissibleValueTest(String eltName) {
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "permissibleValueDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Permissible Values")).click();
        textPresent("cs3");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        textPresent("pv1", By.xpath(prefix + "pv-1" + postfix));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        textPresent("pv3", By.xpath(prefix + "pv-1" + postfix));
        findElement(By.xpath(prefix + "moveTop-1" + postfix)).click();
        textPresent("pv3", By.xpath(prefix + "pv-0" + postfix));
    }
}
