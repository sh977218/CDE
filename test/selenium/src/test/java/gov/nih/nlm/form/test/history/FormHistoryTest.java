package gov.nih.nlm.form.test.history;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormHistoryTest extends NlmCdeBaseTest {

    @Test
    public void formHistory() {
        String formName = "Form History Test";
        String newFormDef = "this is new form def";
        mustBeLoggedInAs(testEditor_username, password);

        goToFormByName(formName);
        goToHistory();
        Assert.assertEquals(2, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());

        goToNaming();
        textPresent("Form testing history");
        editDefinitionByIndex(0, newFormDef, false);
        newFormVersion();

        goToFormByName(formName);
        goToHistory();
        Assert.assertEquals(3, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());
        selectHistoryAndCompare(1, 2);
        textPresent(newFormDef, By.xpath("//*[@id='Definition']//div[contains(@class,'arrayObjAdd')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        clickElement(By.xpath("//*[@id='prior-1']//mat-icon[normalize-space() = 'open_in_new']"));
        switchTab(1);
        textPresent("Warning: this form is archived");
        clickElement(By.id("viewCurrentEltLink"));
        textNotPresent("View current form");
    }
}
