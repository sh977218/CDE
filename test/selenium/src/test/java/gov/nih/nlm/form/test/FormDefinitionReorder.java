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
        goToNaming();
        textPresent("Definition:");
        reorderBySection("definitions", "down", 0);
        textPresent("This form is created for testing reorder definitions", By.cssSelector("[itemprop='definition_1']"));
        reorderBySection("definitions", "up", 2);
        textPresent("Another definition.", By.cssSelector("[itemprop='definition_1']"));
        reorderBySection("definitions", "Top", 2);
        textPresent("This form is created for testing reorder definitions", By.cssSelector("[itemprop='definition_0']"));
    }
}
