package gov.nih.nlm.form.test.termMapping;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTermMappingDelete extends NlmCdeBaseTest {

    @Test
    public void delete() {

        mustBeLoggedInAs(nlm_username, nlm_password);

        goToFormByName("Socioeconomic Status");

        textPresent("D003710 - Demography");
        textPresent("D000328 - Adult");
        textPresent("D011795 - Surveys and Questionnaires");

        clickElement(By.xpath("//li[contains(., 'D011795')]//i[@title='Remove Mesh Term']"));
        clickElement(By.id("confirmRemoveMesh-2"));
        textPresent("Saved");
        closeAlert();

        textPresent("D003710 - Demography");
        textPresent("D000328 - Adult");
        textNotPresent("D011795 - Surveys and Questionnaires");

    }

}