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
        startEditQuestionSectionById("question_0_0");
        List<WebElement> lis = driver.findElements(By.cssSelector("#question_0_0 .select2-selection__choice"));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "×Female Gender");
        Assert.assertEquals(lis.get(1).getText(), "×Male Gender");
        Assert.assertEquals(lis.get(2).getText(), "×Unknown");

        clickElement(By.xpath("//li[@class='select2-selection__choice' and contains(., 'Female Gender')]/span[contains(@class, 'select2-selection__choice__remove')]"));
        textNotPresent("×Female Gender");
        lis = driver.findElements(By.cssSelector("#question_0_0 .select2-selection__choice"));
        Assert.assertEquals(lis.size(), 2);
        Assert.assertEquals(lis.get(0).getText(), "×Male Gender");
        Assert.assertEquals(lis.get(1).getText(), "×Unknown");
        saveEditQuestionSectionById("question_0_0");
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textNotPresent("Female Gender");
        startEditQuestionSectionById("question_0_0");
        clickElement(By.cssSelector(".formDescriptionAnswerList .select2-search__field"));
        clickElement(By.xpath("//li[contains(@class,'select2-results__option') and contains(text(), 'Female Gender')]"));
        saveEditQuestionSectionById("question_0_0");
        newFormVersion();

        goToFormByName(formName);
        goToFormDescription();
        textPresent("Female Gender");
    }

}
