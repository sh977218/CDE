package gov.nih.nlm.form.test.description;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDescriptionRenderTest extends NlmCdeBaseTest {

    @Test
    public void formDescription() {
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Embedded Form: Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("section contains form");
        textPresent("Embedded Form: Inside section form: PROMIS SF v1.0 - Phys. Function 10a");

        textNotPresent("Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?");
        clickElement(By.cssSelector("#inform_0 .expand-form"));
        textPresent("Does your health now limit you in doing vigorous activities, such as running, lifting heavy objects, participating in strenuous sports?");
        textNotPresent("Expand", By.id("inform_0"));
        findElement(By.cssSelector(".expand-form"));
    }

}
