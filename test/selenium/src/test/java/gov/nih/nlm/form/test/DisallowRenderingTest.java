package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DisallowRenderingTest extends BaseFormTest {

    @Test
    public void disallowRendering() {
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textNotPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("Rendering is disabled for this form");
        clickElement(By.id("cdeList_tab"));
        textPresent("Rendering is disabled for this form");


        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
        clickElement(By.id("cdeList_tab"));
        textPresent("36-item Short Form Health Survey (SF-36) - Bodily pain score");
        clickElement(By.id("general_tab"));
        findElement(By.id("disallowRendering")).click();
        saveForm();

        mustBeLoggedOut();
        goToFormByName("Short Form 36-Item Health Survey (SF-36)");
        textPresent("In general, would you say");
        clickElement(By.id("description_tab"));
        textPresent("In general, would you say");
        clickElement(By.id("cdeList_tab"));
        textPresent("36-item Short Form Health Survey (SF-36) - Bodily pain score");
    }

}
