package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends BaseFormTest {

    @Test
    public void disallowRendering() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textNotPresent("In general, would you say");
        findElement(By.id("disallowRendering")).click();
        saveForm();
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textPresent("This form is large");
        clickElement(By.id("renderPreviewButton"));
        textPresent("In general, would you say");
    }

}
