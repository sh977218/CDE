package gov.nih.nlm.form.test.render;

import gov.nih.nlm.form.test.QuestionTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormGeoLocationRenderTest extends QuestionTest {

    @Test
    public void formGeoLocationRender() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String formName = "Geo Location Test";
        goToFormByName(formName);
        goToFormDescription();
        addSection("", "F", 0);
        addQuestionToSection("Geo Location CDE", 0);
        textPresent("(Geo Location)", By.id("question_0-0"));

        goToPreview();
        clickElement(By.id("0-0_location"));
        textPresent("38", By.id("0-0_latitude"));
        textPresent("-77", By.id("0-0_longitude"));
    }

}
