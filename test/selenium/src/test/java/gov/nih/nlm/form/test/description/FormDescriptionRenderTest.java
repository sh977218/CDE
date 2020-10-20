package gov.nih.nlm.form.test.description;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDescriptionRenderTest extends NlmCdeBaseTest {

    @Test
    public void formDescriptionRender() {
        mustBeLoggedInAs(nlm_username,nlm_password);
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        goToFormDescription();
        textPresent("Embedded Form: Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("section contains form");
        textPresent("Embedded Form: Inside section form: PROMIS SF v1.0 - Phys. Function 10a");

        textNotPresent("Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?");
        textPresent("Expand", By.cssSelector("#form_0 .expand-form"));
        clickElement(By.cssSelector("#form_0 .expand-form"));
        textPresent("Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?");
        textNotPresent("Expand", By.cssSelector("#form_0 .expand-form"));
        textPresent("Collapse", By.cssSelector("#form_0 .expand-form"));
        clickElement(By.cssSelector("#form_0 .expand-form"));
        textNotPresent("Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?");
        textPresent("Expand", By.cssSelector("#form_0 .expand-form"));
    }
}
