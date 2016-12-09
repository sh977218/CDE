package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormInsideFormRenderTest extends NlmCdeBaseTest {

    @Test
    public void nativeFormRenderTest() {
        goToFormByName("Loinc Widget Test Form");
        textPresent("Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
    }

    @Test
    public void sdcFormRenderTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("export"));
        clickElement(By.id("sdcHtmlExport"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        switchTabAndClose(0);
    }

    @Test
    public void lFormRenderTest() {
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("button_lforms"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("section contains form");
        textPresent("Are you able to get on and off the toilet?");
        switchTabAndClose(0);
    }

    @Test
    public void formDescriptionTest() {
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("description_tab"));
        textPresent("Embedded Form: Outside section form: PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("section contains form");
        textPresent("Embedded Form: Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
    }


}
