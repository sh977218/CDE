package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddSuggestedCdeTest extends QuestionTest {
    @Test
    public void formAddCde() {
        String form = "formAddSuggestedCdeTest";
        String cdeName1 = "pati";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form);
        goToFormDescription();
        addCdeByNameBeforeId(cdeName1, "question_0_0");
        newFormVersion();
        checkNewCde1();
    }

    private void checkNewCde1() {
        String cdeName1 = "newCde1";
        goToCdeByName(cdeName1);
        goToPermissibleValues();
        textPresent("Text", By.id("datatypeSelect"));
        goToNaming();
        textPresent(cdeName1, By.id("designation_0"));
        textPresent("Question Text", By.id("tags_0"));
    }

}
