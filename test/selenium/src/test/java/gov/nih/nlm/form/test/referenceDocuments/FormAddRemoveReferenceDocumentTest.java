package gov.nih.nlm.form.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddRemoveReferenceDocumentTest extends NlmCdeBaseTest {

    @Test
    public void formAddRemoveReferenceDocument() {
        String formName = "PROMIS SF v1.0-Anxiety 8a";
        String id = "test id";
        String title = "test title";
        String uri = "www.nih.gov";
        String providerOrg = "test provider org";
        String languageCode = "test language code";
        String document = "very very very long test document";

        mustBeLoggedInAs(promis_username, password);
        goToFormByName(formName);
        goToReferenceDocumentsForm();
        addNewReferenceDocument(id, title, uri, providerOrg, languageCode, document);

        clickElement(By.id("removeReferenceDocument-0"));
        textPresent("Confirm Delete");
        clickElement(By.id("confirmRemoveReferenceDocument-0"));
    }
}
