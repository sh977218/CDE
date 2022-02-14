package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class SkipLogicNoLabelTest extends BaseFormTest {
    String[] expectedOptions = new String[]{"Ethnic Group Category Text", "Noncompliant Reason Text", "Person Birth Date", "Gender type", "Walking speed value"};

    @Test
    public void selectNoLabelQuestionTest() {
        String formName = "Skip Logic No Label Form";
        mustBeLoggedInAs(nlm_username, nlm_password);

        goToFormByName(formName);
        goToFormDescription();
        startEditQuestionById("question_0-5");
        clickElement(By.xpath("//*[@id='question_0-5']//*[contains(@class,'skipLogicEditTextarea')]//mat-icon[.='edit']"));
        clickElement(By.id("addNewSkipLogicButton"));
        clickElement(By.xpath(" //*[@class='mat-dialog-title']"));
        clickElement(By.id("skipLogicLabelSelection_0"));
        List<WebElement> options = findElements(By.xpath("//*[@id='skipLogicLabelSelection_0']/option"));
        for (int i = 0; i < expectedOptions.length; i++) {
            Assert.assertEquals(options.get(i).getText().trim(), expectedOptions[i]);
        }
        clickElement(By.xpath("//*[@class='mat-dialog-title']"));
        clickElement(By.id("cancelNewSkipLogicButton"));
        saveEditQuestionById("question_0-5");
    }

}
