package gov.nih.nlm.form.test.termMapping;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDeleteMeshTermMappingTest extends NlmCdeBaseTest {

    @Test
    public void formDeleteMeshTermMapping() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Socioeconomic Status");
        goToGeneralDetailForm();
        textPresent("D003710 - Demography");
        textPresent("D000328 - Adult");
        textPresent("D011795 - Surveys and Questionnaires");

        deleteWithConfirm("//li[contains(., 'D011795')]");
        checkAlert("Saved");
        textPresent("D003710 - Demography");
        textPresent("D000328 - Adult");
        textNotPresent("D011795 - Surveys and Questionnaires");

    }

}
