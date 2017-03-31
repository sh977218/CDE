package gov.nih.nlm.form.test.properties.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends BaseFormTest {

    @Test
    public void disallowRendering() {
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textNotPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("Rendering is disabled for this form");

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
        clickElement(By.id("general_tab"));
        clickElement(By.id("disallowRendering"));
        saveForm();

        mustBeLoggedOut();
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
    }

}
