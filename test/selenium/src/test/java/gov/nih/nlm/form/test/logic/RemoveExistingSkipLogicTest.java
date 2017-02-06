package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveExistingSkipLogicTest extends BaseFormTest {

    @Test
    public void removeExistingSkipLogicTest() {
        String formName = "Remove SkipLogic Form";
        String skipLogic = "\"Quality of Life - Write task list difficulty scale\" =\"5\"";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));

        textPresent(skipLogic);

        startEditQuestionSectionById("question_0_1");
        findElement(By.xpath("//*[@id='question_0_1']//textarea[2]")).clear();
        saveEditQuestionSectionById("question_0_1");

        startEditQuestionSectionById("section_0_2");
        findElement(By.xpath("//*[@id='dd_s_skipLogic_2']//input[2]")).clear();
        saveEditQuestionSectionById("section_0_2");

        startEditQuestionSectionById("inform_0_3");
        findElement(By.xpath("//*[@id='dd_s_skipLogic_3']//input[2]")).clear();
        saveEditQuestionSectionById("inform_0_3");
        saveForm();

        goToFormByName(formName);
        textNotPresent(skipLogic);
    }
}
