package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormInsideFormRenderTest extends NlmCdeBaseTest {

    @Test
    public void nativeFormRenderTest() {
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("nativeFormRenderLink"));
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
    }

    @Test
    public void sdcFormRenderTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("export"));
        clickElement(By.id("sdcExport"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        switchTabAndClose(0);
    }

    @Test
    public void lFormRenderTest() {
        goToFormByName("Loinc Widget Test Form");
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
    }

    @Test
    public void formDescriptionTest() {
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("description_tab"));
        textPresent("Embedded Form: PROMIS SF v1.0 - Phys. Function 10a");
    }


}