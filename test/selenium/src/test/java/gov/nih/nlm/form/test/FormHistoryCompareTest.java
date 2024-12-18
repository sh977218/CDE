package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormHistoryCompareTest extends BaseFormTest {

    @Test
    public void formHistoryCompare() {
        String formName = "Form History Compare Test";
        mustBeLoggedInAs(testEditor_username, password);
        goToFormByName(formName);

        goToHistory();
        Assert.assertEquals(4, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr[td]")).size());
        selectHistoryAndCompare(2, 3);
        textPresent("Neoadjuvant Therapy", By.xpath("//*[@id='Form Elements_1']//div[contains(@class,'arrayObjEdit')]//div[contains(@class,'skipLogic.condition')]"));
        textPresent("Yes (specify type)", By.xpath("//*[@id='Form Elements_1']//div[contains(@class,'arrayObjEdit')]//div[contains(@class,'skipLogic.condition')]"));
        textPresent("=", By.xpath("//*[@id='Form Elements_1']//div[contains(@class,'arrayObjEdit')]//div[contains(@class,'skipLogic.condition')]"));
        clickElement(By.id("closeHistoryCompareModal"));
    }
}