package gov.nih.nlm.form.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormReorderReferenceDocumentsTest extends NlmCdeBaseTest {
    @Test
    public void formReorderReferenceDocuments() {
        String formName = "Reorder reference document form";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);

        goToReferenceDocumentsForm();
        clickElement(By.id("moveDown-0"));
        textPresent("rd1", By.cssSelector("[itemprop='id_1']"));
        clickElement(By.id("moveDown-1"));
        textPresent("rd3", By.cssSelector("[itemprop='id_1']"));
        clickElement(By.id("moveTop-2"));
        textPresent("rd1", By.cssSelector("[itemprop='id_0']"));
    }
}
