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
        showAllTabs();
        clickElement(By.id("history_tab"));
        textPresent("List of previous versions");
        Assert.assertEquals(4, driver.findElements(By.xpath("//*[@id='historyTable']/tbody/tr")).size());

        selectHistoryAndCompare(2,3);
        findElement(By.xpath("//*[@id='historyCompareLeft_Form Description_0_1']//*[contains(@class,'unmatchedIcon')]"));
        findElement(By.xpath("//*[@id='historyCompareLeft_Form Description_0_2']//*[contains(@class,'unmatchedIcon')]"));
        findElement(By.xpath("//*[@id='historyCompareRight_Form Description_0_4']//*[contains(@class,'unmatchedIcon')]"));
        findElement(By.xpath("//*[@id='historyCompareRight_Form Description_0_5']//*[contains(@class,'unmatchedIcon')]"));

        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[2]"));
        selectHistoryAndCompare(1,2);
        textPresent("Reordered",
                By.xpath("//*[@id='historyCompareLeft_Form Description_0_4']//div[contains(@class,'compareMessage')]"));
        textPresent("Reordered",
                By.xpath("//*[@id='historyCompareRight_Form Description_0_2']//div[contains(@class,'compareMessage')]"));
    }

    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
        textPresent("Differences");
    }
}
