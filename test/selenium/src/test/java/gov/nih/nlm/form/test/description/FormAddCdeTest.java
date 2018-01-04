package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;

import org.testng.annotations.Test;

public class FormAddCdeTest extends QuestionTest {
    @Test
    public void formAddCde() {
        String form = "";
        String cdeName1 = "";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();
        addCdeAfter(cdeName1,"");
    }
}
