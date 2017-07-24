package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends BaseFormTest {

    @Test
    public void disallowRendering() {
        String formName = "Short Form 36-Item Health Survey (SF-36)";
        goToFormByName(formName);
        textNotPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("Rendering is disabled for this form");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
        clickElement(By.id("general_tab"));
        clickElement(By.id("disallowRendering"));
        saveForm();

        mustBeLoggedOut();
        goToFormByName(formName);
        textPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
    }

}
