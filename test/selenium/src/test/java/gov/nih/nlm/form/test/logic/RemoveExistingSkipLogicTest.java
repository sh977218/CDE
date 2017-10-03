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
        clickElement(By.id("description_tab"));

        textPresent(skipLogic);

        startEditQuestionSectionById("question_0_1");
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#question_0_1 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditQuestionSectionById("question_0_1");

        startEditQuestionSectionById("section_0_2");
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#section_0_2 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditQuestionSectionById("section_0_2");

        startEditQuestionSectionById("inform_0_3");
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).clear();
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).sendKeys(Keys.SPACE);
        findElement(By.cssSelector("#inform_0_3 input.skipLogicCondition")).sendKeys(Keys.BACK_SPACE);
        saveEditQuestionSectionById("inform_0_3");
        newFormVersion();

        goToFormByName(formName);
        textNotPresent(skipLogic);
    }
}
