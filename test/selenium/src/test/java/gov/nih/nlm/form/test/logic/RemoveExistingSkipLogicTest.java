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

        startEditQuestionById("question_0_1");
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditQuestionById("question_0_1");

        startEditSectionById("section_0_2");
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditSectionById("section_0_2");

        startEditSectionById("inform_0_3");
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditSectionById("inform_0_3");
        newFormVersion();

        goToFormByName(formName);
        textNotPresent(skipLogic);
    }
}
