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

        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[2]"));
        selectHistoryAndCompare(1, 2);

        String boarderCss = findElement(By.xpath("//*[@id='Form Elements_2']")).getCssValue("border-left");
        Assert.assertTrue(boarderCss.contains("#fad000"));
    }

    protected void selectHistoryAndCompare(Integer leftIndex, Integer rightIndex) {
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + leftIndex + "]"));
        clickElement(By.xpath("//*[@id='historyTable']/tbody/tr[" + rightIndex + "]"));
        clickElement(By.id("historyCompareBtn"));
        textPresent("Changes");
    }
}
