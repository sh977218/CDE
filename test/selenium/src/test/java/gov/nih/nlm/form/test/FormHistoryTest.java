package gov.nih.nlm.form.test;

import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormHistoryTest extends BaseFormTest {

    @Test
    public void formHistoryTest() {
        String formName = "Form History Test";
        String newFormDef = "this is new form def";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(2, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr")).size());

        clickElement(By.id("naming_tab"));
        textPresent("this form crated for testing form history");
        clickElement(By.xpath("//*[@id='dd_def_0']//i"));
        findElement(By.xpath("//*[@id='dd_def_0']//textarea")).clear();
        findElement(By.xpath("//*[@id='dd_def_0']//textarea")).sendKeys(newFormDef);
        clickElement(By.xpath("//*[@id='dd_def_0']//button[contains(text(),'Confirm')]"));
        textPresent(newFormDef, By.id("dd_def_0"));
        saveForm();

        goToFormByName(formName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(3, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr")).size());

        clickElement(By.id("prior-1"));
        textPresent("View current form");
        clickElement(By.id("viewCurrentEltLink"));
        textNotPresent("View current form");
    }
}
