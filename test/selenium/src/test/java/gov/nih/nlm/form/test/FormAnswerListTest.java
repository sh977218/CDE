package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class FormAnswerListTest extends NlmCdeBaseTest {

    @Test
    public void formAnswerList() {
        String formName = "Answer List Test";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        textNotPresent("Multiple Selections:");
        startEditQuestionById("question_0-0");
        String question_zero_answer_list_xpath = "//*[@id='question_0-0']//*[contains(@class,'ng-value ng-star-inserted')]";
        List<WebElement> lis = driver.findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "×Female Gender");
        Assert.assertEquals(lis.get(1).getText(), "×Male Gender");
        Assert.assertEquals(lis.get(2).getText(), "×Unknown");


        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'answerListLabel')]//mat-icon"));
        clickElement(By.id("moveUp-1"));
        clickElement(By.id("saveEditAnswerBtn"));
        lis = driver.findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "×Male Gender");
        Assert.assertEquals(lis.get(1).getText(), "×Female Gender");
        Assert.assertEquals(lis.get(2).getText(), "×Unknown");


        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'ng-value ng-star-inserted') and contains(., 'Female Gender')]//span[contains(.,'×')]"));
        textNotPresent("×Female Gender");
        lis = driver.findElements(By.xpath(question_zero_answer_list_xpath));
        Assert.assertEquals(lis.size(), 2);
        Assert.assertEquals(lis.get(0).getText(), "×Male Gender");
        Assert.assertEquals(lis.get(1).getText(), "×Unknown");
        saveEditQuestionById("question_0-0");
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textNotPresent("Female Gender");
        startEditQuestionById("question_0-0");
        clickElement(By.xpath("//*[@id='question_0-0']//*[contains(@class,'answerList')]/ng-select//input"));
        selectNgSelectDropdownByText("Female Gender");
        saveEditQuestionById("question_0-0");
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textPresent("Female Gender");
    }

}
