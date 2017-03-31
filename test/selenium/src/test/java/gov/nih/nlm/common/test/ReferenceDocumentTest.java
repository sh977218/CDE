package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class ReferenceDocumentTest extends CommonTest {

    protected abstract void goToElt(String name);

    public void reorderReferenceDocumentTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);

        clickElement(By.id("referenceDocument_tab"));

        clickElement(By.xpath("//div[@id='moveDown-0']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='id_1']")).getText().contains("rd1"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='id_1']")).getText().contains("rd3"));
        clickElement(By.xpath("//div[@id='moveTop-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='id_0']")).getText().contains("rd1"));

    }
}
