package gov.nih.nlm.form.test.section;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.form.test.QuestionTest;
import org.testng.annotations.Test;

public class CreateEditSection4 extends QuestionTest {

    @Test
    public void createEditSection4() {
        mustBeLoggedInAs(testAdmin_username, password);
        String cdeName = "Race Category Text";
        String formName = "Section Test Form4";

        goToFormByName(formName);
        goToFormDescription();

        addQuestionToSection(cdeName, 2);
    }


}
