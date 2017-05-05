package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AnswerListTest extends BaseFormTest {

    @Test
    public void answerList() {
        mustBeLoggedInAs(testAdmin_username, password);

        String formName = "Answer List Test";

        goToFormByName(formName);
        clickElement(By.id("description_tab"));

        textNotPresent("Multiple Selections:");
        startEditQuestionSectionById("question_0_0");
        List<WebElement> lis = driver.findElements(By.xpath("//div[@id = 'question_0_0']//li[@class='select2-selection__choice']"));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "Female Gender");
        Assert.assertEquals(lis.get(1).getText(), "Male Gender");
        Assert.assertEquals(lis.get(2).getText(), "Unknown");

        clickElement(By.xpath("//li[@class='select2-selection__choice' and contains(., \"Female Gender\")]/span[contains(@class, 'select2-selection__choice__remove')]"));
        textNotPresent("Female Gender");
        lis = driver.findElements(By.xpath("//div[@id = 'question_0_0']//li[@class='select2-selection__choice']"));
        Assert.assertEquals(lis.size(), 2);
        Assert.assertEquals("Male Gender", lis.get(0).getText());
        Assert.assertEquals("Unknown", lis.get(1).getText());

        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textNotPresent("Female Gender");
        startEditQuestionSectionById("question_0_0");
        clickElement(By.xpath("//input[@class='select2-search__field']"));
        clickElement(By.xpath("//li[contains(@class,'select2-results__option') and contains(text(), 'Female Gender')]"));
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Female Gender");
    }

}
