package gov.nih.nlm.common.test;

import org.openqa.selenium.By;

public abstract class PermissibleValueTest extends CommonTest {

    public void reorderPermissibleValueTest(String eltName) {
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        clickElement(By.linkText("Permissible Values"));
        clickElement(By.xpath("//div[@id='moveDown-0']"));
        textPresent("pv1", By.xpath("//div[@id='pv-1']"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        textPresent("pv3", By.xpath("//div[@id='pv-1']"));
        clickElement(By.xpath("//div[@id='moveTop-1']"));
        textPresent("pv3", By.xpath("//div[@id='pv-0']"));
    }
}
