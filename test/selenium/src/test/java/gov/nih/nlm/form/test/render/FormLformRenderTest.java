package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormLformRenderTest extends NlmCdeBaseTest {


    @Test
    public void lFormRender() {
        String formName = "Loinc Widget Test Form";
        goToFormByName(formName);
        clickElement(By.id("dropdownMenuButton"));
        clickElement(By.id("button_lforms"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("section contains form");
        textPresent("Are you able to get on and off the toilet?");
        switchTabAndClose(0);
    }

}
