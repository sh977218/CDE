package gov.nih.nlm.form.test.description;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSelectQuestionNoLabelTest extends NlmCdeBaseTest {
    @Test
    public void formEditSectionNoLabel() {
        String formName = "Imaging OCT Analysis -Cirrus Macular Thickness";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToFormByName(formName);
        goToFormDescription();
        String questionId = "question_0-0";
        startEditQuestionById(questionId);
        selectQuestionNoLabel(questionId);
        textPresent("(No Label)", By.id(questionId));
    }
}
