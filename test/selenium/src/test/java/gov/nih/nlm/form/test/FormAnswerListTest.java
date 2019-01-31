package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class FormAnswerListTest extends NlmCdeBaseTest {


    @Test
    public void reorderFormAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        startEditQuestionById("question_0-0");
        String question_xpath = "//*[@id='question_0-0']//mat-chip";
        List<WebElement> listBeforeReorder = findElements(By.xpath(question_xpath));
        Assert.assertEquals(listBeforeReorder.size(), 3);
        Assert.assertTrue(listBeforeReorder.get(0).getText().contains("Female Gender"));
        Assert.assertTrue(listBeforeReorder.get(1).getText().contains("Male Gender"));
        Assert.assertTrue(listBeforeReorder.get(2).getText().contains("Unknown"));

        // edit answer list
        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'answerListLabel')]//mat-icon"));
        clickElement(By.id("moveUp-1"));
        clickElement(By.id("saveEditAnswerBtn"));
        hangon(1);

        List<WebElement> listAfterReorder = findElements(By.xpath(question_xpath));
        Assert.assertTrue(listAfterReorder.get(0).getText().contains("Male Gender"));
        Assert.assertTrue(listAfterReorder.get(1).getText().contains("Female Gender"));
        Assert.assertTrue(listAfterReorder.get(2).getText().contains("Unknown"));
        saveEditQuestionById("question_0-0");
        newFormVersion();
    }

    @Test
    public void deleteFormAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        startEditQuestionById("question_0-1");
        String question_xpath = "//*[@id='question_0-1']//mat-chip";
        List<WebElement> listBeforeDelete = findElements(By.xpath(question_xpath));
        Assert.assertEquals(listBeforeDelete.size(), 7);
        Assert.assertTrue(listBeforeDelete.get(0).getText().contains("American Indian or Alaska Native"));
        Assert.assertTrue(listBeforeDelete.get(1).getText().contains("Asian"));

        // delete answer list
        clickElement(By.xpath("//*[@id='question_0-1']//mat-chip[contains(., 'American Indian or Alaska Native')]//mat-icon"));

        List<WebElement> listAfterDelete = findElements(By.xpath(question_xpath));
        Assert.assertEquals(listAfterDelete.size(), 6);
        Assert.assertTrue(listBeforeDelete.get(1).getText().contains("Asian"));
        saveEditQuestionById("question_0-1");
        newFormVersion();
    }

}
