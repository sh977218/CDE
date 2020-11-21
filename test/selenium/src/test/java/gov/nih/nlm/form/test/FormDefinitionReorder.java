package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDefinitionReorder extends NlmCdeBaseTest {

    @Test
    public void formReorderDefinitionTest() {
        String formName = "Reorder definition form";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToNamingForm();
        textPresent("Definition:");
        clickElement(By.id("moveDown-0"));
        textPresent("This form is created for testing reorder definitions", By.cssSelector("[itemprop='definition_1']"));
        clickElement(By.id("moveUp-2"));
        textPresent("Another definition.", By.cssSelector("[itemprop='definition_1']"));
        clickElement(By.id("moveTop-2"));
        textPresent("This form is created for testing reorder definitions", By.cssSelector("[itemprop='definition_0']"));
    }
}
