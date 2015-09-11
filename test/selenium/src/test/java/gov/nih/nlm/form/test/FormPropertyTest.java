package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormPropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }

    @Test
    public void autocomplete() {
        autocomplete("Skin Cancer Patient", "autoc", "Autocomplete");
    }

    @Test
    public void addRemoveFormProperty() {
        addRemoveProperty("Form Property Test", "Recorded");
    }

    @Test
    public void richPropText() {
        richText("Form Rich Text Property Test", "Recorded");
    }


    @Test
    public void formReorderPropertyTest() {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName("form for test cde reorder detail tabs", null);
        String tabName = "propertiesDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Properties")).click();
        textPresent("Add Property");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        org.testng.Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("pk1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        org.testng.Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_2" + postfix)).getText().contains("pk2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        org.testng.Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("pk2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        org.testng.Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("pk3"));
    }
}
