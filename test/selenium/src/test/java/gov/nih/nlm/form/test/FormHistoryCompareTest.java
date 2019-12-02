package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormHistoryCompareTest extends BaseFormTest {

    @Test
    public void formHistoryCompareTest() {
        String formName = "Form History Compare Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);

        goToHistory();
        textPresent("List of previous versions");
        Assert.assertEquals(4, driver.findElements(By.xpath("//*[@id='historyTable']/tr[td]")).size());
        selectHistoryAndCompare(2, 3);
        textPresent("Neoadjuvant Therapy", By.xpath("//*[@id='Form Elements_3']//div[contains(@class,'Skip Logic')]//ins"));
        textPresent("Yes (specify type)", By.xpath("//*[@id='Form Elements_3']//div[contains(@class,'Skip Logic')]//ins"));
        textPresent("=", By.xpath("//*[@id='Form Elements_3']//div[contains(@class,'Skip Logic')]//ins"));
        clickElement(By.id("closeHistoryCompareModal"));

        clickElement(By.xpath("//*[@id='historyTable']/tr[td][2]"));
        clickElement(By.xpath("//*[@id='historyTable']/tr[td][3]"));
        selectHistoryAndCompare(1, 2);
        textPresent("Neoadjuvant Therapy", By.xpath("//*[@id='Form Elements_2']//div[contains(@class,'arrayObjReorder')]//div[contains(@class,'Skip Logic')]"));
        textPresent("Yes (specify type)", By.xpath("//*[@id='Form Elements_2']//div[contains(@class,'arrayObjReorder')]//div[contains(@class,'Skip Logic')]"));
        textPresent("=", By.xpath("//*[@id='Form Elements_2']//div[contains(@class,'arrayObjReorder')]//div[contains(@class,'Skip Logic')]"));
    }
}
