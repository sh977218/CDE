package gov.nih.nlm.form.test;

import gov.nih.nlm.form.test.regstatus.FormRegStatusTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AnswerListTest extends BaseFormTest {
    private QuestionTest questionTest = new QuestionTest();

    @Test
    public void answerList() {
        mustBeLoggedInAs(testAdmin_username, password);

        String formName = "Answer List Test";
        String formDef = "Form to test answer lists";
        String formV = "0.1alpha";

        goToFormByName(formName);
        clickElement(By.id("description_tab"));

        clickElement(By.id("question_accordion_0_0"));
        List<WebElement> lis = driver.findElements(By.xpath("//div[@id = 'question_0']//ul[@class='select2-choices']//li/span/span"));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "Female Gender");
        Assert.assertEquals(lis.get(1).getText(), "Male Gender");
        Assert.assertEquals(lis.get(2).getText(), "Unknown");

        clickElement(By.xpath("//div[@id='question_0']//ul[@class='select2-choices']//li[1]/a"));
        textNotPresent("Female Gender");
        lis = driver.findElements(By.xpath("//div[@id = 'question_0']//ul[@class='select2-choices']//li/span/span"));
        Assert.assertEquals(lis.size(), 2);
        Assert.assertEquals("Male Gender", lis.get(0).getText());
        Assert.assertEquals("Unknown", lis.get(1).getText());

        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        clickElement(By.id("question_accordion_0_0"));
        textNotPresent("Female Gender");
        clickElement(By.xpath("//input[@ng-click='$select.activate()']"));
        clickElement(By.xpath("//span[contains(text(), 'Female Gender')]"));
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        clickElement(By.id("question_accordion_0_0"));
        textPresent("Female Gender");
    }

}
