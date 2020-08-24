package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSdcRenderTest extends NlmCdeBaseTest {


    @Test
    public void sdcFormRenderTest() {
        String formName = "Loinc Widget Test Form";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'XML File, SDC Schema with XSL Transform')]"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        switchTabAndClose(0);
    }
}
