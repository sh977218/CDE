package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ReferenceDocumentTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormRefDocumentTest extends ReferenceDocumentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    protected void goToElt(String eltName) {
        goToFormByName(eltName);
    }

    @Test
    public void formReferenceDocumentTest() {
        referenceDocumentTest("PROMIS SF v1.0-Anxiety 8a");
    }


    @Test
    public void formReorderReferenceDocumentTest() {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName("form for test cde reorder detail tabs", null);
        String tabName = "referrenceDocumentsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Reference Documents")).click();
        textPresent("Language Code:");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_2" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_0" + postfix)).getText().contains("rd3"));

    }

}
