package gov.nih.nlm.form.test;

import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;
import java.util.ArrayList;

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
        textPresent("Form testing history");
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

        selectHistoryAndCompare(1,2);
        textPresent(newFormDef, By.xpath("//*[@id='historyCompareLeft_Naming_0']//div[@data-title='definition']"));

        clickElement(By.id("prior-1"));
        ArrayList<String> wintabs = new ArrayList<String> (driver.getWindowHandles());
        driver.switchTo().window(wintabs.get(1));
        textPresent("View current form");
        clickElement(By.id("viewCurrentEltLink"));
        textNotPresent("View current form");
        driver.close();
        driver.switchTo().window(wintabs.get(0));
        textNotPresent("View current form");


    }

    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
        textPresent("Differences");
    }
}
