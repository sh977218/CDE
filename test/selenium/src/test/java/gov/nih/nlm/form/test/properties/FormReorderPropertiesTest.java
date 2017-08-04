package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormReorderPropertiesTest extends NlmCdeBaseTest {
    @Test
    public void formReorderPropertiesTest() {
        String formName = "form for test cde reorder detail tabs";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        clickElement(By.id("properties_tab"));
        clickElement(By.id("moveDown-0"));
        textPresent("Property reordered.");
        closeAlert();
        textPresent("pk1", By.id("key_1"));
        clickElement(By.id("moveUp-2"));
        textPresent("Property reordered.");
        closeAlert();
        textPresent("pk3", By.id("key_1"));
        clickElement(By.id("moveTop-2"));
        textPresent("Property reordered.");
        closeAlert();
        textPresent("pk1", By.id("key_0"));
    }

}
