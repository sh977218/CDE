package gov.nih.nlm.form.test.render;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormGeoLocationRenderTest extends NlmCdeBaseTest {
    
    @Test
    public void formGeoLocationRender() {
        String formName = "Geo Location Test";
        goToFormByName(formName);
        clickElement(By.id("0-0_location"));
        textPresent("38", By.id("0-0_latitude"));
        textPresent("-77", By.id("0-0_longitude"));
    }

}
