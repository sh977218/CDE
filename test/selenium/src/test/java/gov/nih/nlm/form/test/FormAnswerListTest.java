package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class FormAnswerListTest extends NlmCdeBaseTest {


    @Test
    public void deleteFormAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        startEditQuestionById("question_0-0");
        String question_zero_answer_list_xpath = "//*[@id='question_0-0']//mat-chip";
        List<WebElement> listBeforeDelete = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(listBeforeDelete.size(), 3);
        Assert.assertTrue(listBeforeDelete.get(0).getText().contains("Female Gender"));
        Assert.assertTrue(listBeforeDelete.get(1).getText().contains("Male Gender"));
        Assert.assertTrue(listBeforeDelete.get(2).getText().contains("Unknown"));

        // delete answer list
        clickElement(By.xpath("//*[@id='question_0-0']//mat-chip[contains(., 'Female Gender')]//mat-icon"));

        List<WebElement> listAfterDelete = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(listAfterDelete.size(), 2);
        Assert.assertTrue(listBeforeDelete.get(0).getText().contains("Male Gender"));
        Assert.assertTrue(listBeforeDelete.get(1).getText().contains("Unknown"));
        saveEditQuestionById("question_0-0");
        newFormVersion();
    }

    @Test
    public void reorderFormAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        startEditQuestionById("question_0-1");
        String question_zero_answer_list_xpath = "//*[@id='question_0-1']//mat-chip";
        List<WebElement> listBeforeReorder = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(listBeforeReorder.size(), 7);
        Assert.assertTrue(listBeforeReorder.get(0).getText().contains("American Indian or Alaska Native"));
        Assert.assertTrue(listBeforeReorder.get(1).getText().contains("Asian"));

        // edit answer list
        clickElement(By.xpath("//*[@id='question_0-1']//*[contains(@class,'answerListLabel')]//mat-icon"));
        clickElement(By.id("moveUp-1"));
        clickElement(By.id("saveEditAnswerBtn"));
        hangon(1);

        List<WebElement> listAfterReorder = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertTrue(listAfterReorder.get(0).getText().contains("Asian"));
        Assert.assertTrue(listAfterReorder.get(1).getText().contains("American Indian or Alaska Native"));
        saveEditQuestionById("question_0-1");
        newFormVersion();
    }


    @Test
    public void addFormAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        startEditQuestionById("question_0-2");
        String question_zero_answer_list_xpath = "//*[@id='question_0-2']//mat-chip";
        List<WebElement> listBeforeAdd = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(listBeforeAdd.size(), 4);
        Assert.assertTrue(listBeforeAdd.get(0).getText().contains("present"));
        Assert.assertTrue(listBeforeAdd.get(1).getText().contains("Death"));
        Assert.assertTrue(listBeforeAdd.get(2).getText().contains("intubation indicated"));
        Assert.assertTrue(listBeforeAdd.get(3).getText().contains("None"));

        //add answer list
        clickElement(By.xpath("//*[@id='question_0-2']//*[contains(@class,'answerList')]//input"));
        findElement(By.xpath("//*[@id='question_0-2']//*[contains(@class,'answerList')]//input")).sendKeys("New Value,");

        List<WebElement> listAfterAdd = findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(listAfterAdd.size(), 5);
        Assert.assertTrue(listBeforeAdd.get(0).getText().contains("present"));
        Assert.assertTrue(listBeforeAdd.get(1).getText().contains("Death"));
        Assert.assertTrue(listBeforeAdd.get(2).getText().contains("intubation indicated"));
        Assert.assertTrue(listBeforeAdd.get(3).getText().contains("None"));
        Assert.assertTrue(listBeforeAdd.get(4).getText().contains("New Value"));
        saveEditQuestionById("question_0-2");
        newFormVersion();
    }

}
