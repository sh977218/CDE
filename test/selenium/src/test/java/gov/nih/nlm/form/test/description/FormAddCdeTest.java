package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;

import org.testng.annotations.Test;

public class FormAddCdeTest extends QuestionTest {
    @Test
    public void formAddCde() {
        String form = "formAddCdeTest";
        String cdeName1 = "newCde1";
        String[] cdeNames = new String[]{"newCde2", "newCde3", "newCde4"};
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();
        addCdeBeforeId(cdeName1, "question_0_0");
        addCdes(cdeNames);
    }

}
