package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends BaseFormTest {

    @Test
    public void disallowRendering() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textPresent("Main Section");
        findElement(By.id("disallowRendering")).click();
        textNotPresent("Main Section");
        saveForm();
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textNotPresent("Main Section");
    }

}
