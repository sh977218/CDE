package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class SkipLogicNoLabelTest extends BaseFormTest {

    @Test
    public void selectNoLabelQuestionTest() {
        String formName = "Skip Logic No Label Form";
        mustBeLoggedInAs(nlm_username, nlm_password);

        goToFormByName(formName);
        goToFormDescription();
        startEditQuestionById("question_0-5");
        clickElement(By.xpath("//*[@id='question_0-5']//*[contains(@class,'skipLogicEditTextarea')]//mat-icon[.='edit']"));
        clickElement(By.id("addNewSkipLogicButton"));
        clickElement(By.xpath(" //h1[@class='mat-dialog-title']"));
        clickElement(By.xpath("//cde-question-autocomplete[last()]"));
        List<WebElement> matOptions = findElements(By.xpath("//mat-option/span"));
        Assert.assertEquals("Ethnic Group Category Text", matOptions.get(0).getText());
        Assert.assertEquals("Noncompliant Reason Text", matOptions.get(1).getText());
        Assert.assertEquals("Person Birth Date", matOptions.get(2).getText());
        Assert.assertEquals("Gender type", matOptions.get(3).getText());
        Assert.assertEquals("Walking speed value", matOptions.get(4).getText());
        clickElement(By.xpath(" //h1[@class='mat-dialog-title']"));
        clickElement(By.id("cancelNewSkipLogicButton"));
        saveEditQuestionById("question_0-5");
    }

}
