package gov.nih.nlm.form.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormReorderReferenceDocumentsTest extends NlmCdeBaseTest {
    @Test
    public void formReorderReferenceDocuments() {
        String formName = "form for test cde reorder detail tabs";

        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);

        clickElement(By.id("referenceDocument_tab"));
        clickElement(By.id("moveDown-0"));
        textPresent("rd1", By.id("id_1"));
        clickElement(By.id("moveDown-2"));
        textPresent("rd3", By.id("id_1"));
        clickElement(By.id("moveDown-2"));
        textPresent("rd1", By.id("id_0"));
    }
}
