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
        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(2, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());

        clickElement(By.id("naming_tab"));
        textPresent("Form testing history");
        editDefinitionByIndex(0, newFormDef, false);
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(3, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());
        selectHistoryAndCompare(1, 2);
        textPresent(newFormDef, By.xpath("//*[@id='Naming']//ins"));
        clickElement(By.id("closeHistoryCompareModal"));

        clickElement(By.id("prior-1"));
        switchTab(1);
        textPresent("View current form");
        clickElement(By.id("viewCurrentEltLink"));
        textNotPresent("View current form");
    }
}
