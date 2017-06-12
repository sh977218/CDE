package gov.nih.nlm.form.test;

import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormHistoryCompareTest extends BaseFormTest {

    @Test
    public void formHistoryCompareTest() {
        String formName = "Form History Compare Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);

        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(4, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());
        selectHistoryAndCompare(2, 3);
        textPresent("\"Neoadjuvant Therapy\" = \"Yes (specify type)\"", By.xpath("//*[@id='Form Elements_3']//ins"));
        clickElement(By.id("closeHistoryCompareModal"));

        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[2]"));
        selectHistoryAndCompare(1, 2);
        textPresent("\"Neoadjuvant Therapy\" = \"Yes (specify type)\"", By.xpath("//*[@id='Form Elements_2']//div[contains(@class,'arrayObjReorder')]"));
    }
}
