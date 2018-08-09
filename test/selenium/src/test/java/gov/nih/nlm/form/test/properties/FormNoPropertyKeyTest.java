package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormNoPropertyKeyTest extends NlmCdeBaseTest {

    @Test
    public void formNoPropertyKey() {
        String formName = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        textPresent("No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
    }

}
