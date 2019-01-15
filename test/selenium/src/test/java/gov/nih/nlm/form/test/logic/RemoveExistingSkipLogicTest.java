package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class RemoveExistingSkipLogicTest extends BaseFormTest {

    @Test
    public void removeExistingSkipLogic() {
        String formName = "Remove SkipLogic Form";
        String skipLogic = "\"Quality of Life - Write task list difficulty scale\" =\"5\"";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToFormDescription();

        textPresent(skipLogic);

        String xpath1 = "//*[@id='question_0-1']//*[contains(@class,'skipLogicCondition')]//input";
        startEditQuestionById("question_0-1");
        findElement(By.xpath(xpath1)).clear();
        findElement(By.xpath(xpath1)).sendKeys(Keys.SPACE);
        findElement(By.xpath(xpath1)).sendKeys(Keys.BACK_SPACE);
        saveEditQuestionById("question_0-1");

        String xpath2 = "//*[@id='section_0-2']//*[contains(@class,'skipLogicCondition')]//input";
        startEditSectionById("section_0-2");
        findElement(By.xpath(xpath2)).clear();
        findElement(By.xpath(xpath2)).sendKeys(Keys.SPACE);
        findElement(By.xpath(xpath2)).sendKeys(Keys.BACK_SPACE);
        saveEditSectionById("section_0-2");

        String xpath3 = "//*[@id='form_0-3']//*[contains(@class,'skipLogicCondition')]//input";
        startEditSectionById("form_0-3");
        findElement(By.xpath(xpath3)).clear();
        findElement(By.xpath(xpath3)).sendKeys(Keys.SPACE);
        findElement(By.xpath(xpath3)).sendKeys(Keys.BACK_SPACE);
        saveEditSectionById("form_0-3");
        newFormVersion();

        goToFormByName(formName);
        textNotPresent(skipLogic);
    }
}
