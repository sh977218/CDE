package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends NlmCdeBaseTest {

    @Test
    public void disallowRendering() {
        String formName = "Short Form 36-Item Health Survey (SF-36)";
        goToFormByName(formName);
        textNotPresent("In general, would you say");
        textPresent("Rendering has been disabled for this form");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToFormDescription();
        textPresent("In general, would you say");
        saveFormEdit();
        goToGeneralDetailForm();
        clickElement(By.id("disallowRendering"));
        newFormVersion();

        logout();
        goToFormByName(formName);
        textPresent("In general, would you say");
    }

}
