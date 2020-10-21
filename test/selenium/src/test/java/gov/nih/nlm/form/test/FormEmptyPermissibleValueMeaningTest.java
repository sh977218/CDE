package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class FormEmptyPermissibleValueMeaningTest extends QuestionTest {

    @Test
    public void formEmptyPermissibleValueMeaning() {
        String cdeName = "McGill Quality of Life Questionnaire (MQOL) - troublesome physical symptom problem score";
        String formName = "PROMIS SF v1.0 - Applied Cog Abilities 4a";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToFormDescription();
        addQuestionToSection(cdeName, 0);
        saveFormEdit();
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        List<WebElement> lis = driver.findElements(By.xpath("//div[@id = 'question_0-0']//span[contains(@class, 'badge')]"));
        Assert.assertEquals(lis.size(), 11);
        Assert.assertEquals(lis.get(0).getText(), "no problem");
        Assert.assertEquals(lis.get(1).getText(), "1");
        Assert.assertEquals(lis.get(2).getText(), "2");
        Assert.assertEquals(lis.get(3).getText(), "3");
        Assert.assertEquals(lis.get(4).getText(), "4");
        Assert.assertEquals(lis.get(5).getText(), "5");
        Assert.assertEquals(lis.get(6).getText(), "6");
        Assert.assertEquals(lis.get(7).getText(), "7");
        Assert.assertEquals(lis.get(8).getText(), "8");
        Assert.assertEquals(lis.get(9).getText(), "9");
        Assert.assertEquals(lis.get(10).getText(), "tremendous problem");

    }
}
