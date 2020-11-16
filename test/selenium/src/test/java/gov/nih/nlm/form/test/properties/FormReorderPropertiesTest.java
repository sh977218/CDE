package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormReorderPropertiesTest extends NlmCdeBaseTest {
    @Test
    public void formReorderProperties() {
        String formName = "form for test cde reorder detail tabs";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToPropertiesForm();
        clickElement(By.id("moveDown-0"));
        textPresent("Draft");
        closeAlert();
        textPresent("pk1", By.cssSelector("[itemprop='key_1']"));
        clickElement(By.id("moveUp-2"));
        textPresent("Draft");
        closeAlert();
        textPresent("pk3", By.cssSelector("[itemprop='key_1']"));
        clickElement(By.id("moveTop-2"));
        textPresent("Draft");
        closeAlert();
        textPresent("pk1", By.cssSelector("[itemprop='key_0']"));
    }

}
