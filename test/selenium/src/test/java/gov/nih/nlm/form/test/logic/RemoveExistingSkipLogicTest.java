package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RemoveExistingSkipLogicTest extends BaseFormTest {

    @Test
    public void removeExistingSkipLogic() {
        String formName = "Remove SkipLogic Form";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textNotPresent("Patient Gender Code");
        checkElementDoesNotExistByLocator(By.xpath("(//*[@id='Quality of Life - Write task list difficulty scale_0-0']//input[@type='radio'])[1]"));
        textPresent("Patient Gender Code");

        goToFormDescription();
        startEditQuestionById("question_0-1");
        deleteSkipLogicById("question_0-1");
        saveEditQuestionById("question_0-1");

        newFormVersion();

        goToFormByName(formName);
        goToPreview();
        togglePrintableLogic();
        textPresent("Patient Gender Code");
        checkElementDoesNotExistByLocator(By.xpath("(//*[@id='Quality of Life - Write task list difficulty scale_0-0']//input[@type='radio'])[1]"));
        textPresent("Patient Gender Code");
    }
}
