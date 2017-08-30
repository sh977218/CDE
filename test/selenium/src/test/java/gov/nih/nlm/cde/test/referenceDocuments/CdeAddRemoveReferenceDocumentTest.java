package gov.nih.nlm.cde.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddRemoveReferenceDocumentTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddRemoveReferenceDocument() {
        String cdeName = "Post traumatic amnesia verify type";
        String id = "test id";
        String title = "test title";
        String uri = "www.nih.gov";
        String providerOrg = "test provider org";
        String languageCode = "test language code";
        String document = "very very very long test document";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("referenceDocuments_tab"));
        addNewReferenceDocument(id, title, uri, providerOrg, languageCode, document);

        clickElement(By.id("removeReferenceDocument-0"));
        textPresent("Confirm Delete");
        clickElement(By.id("confirmRemoveReferenceDocument-0"));
        textPresent("saved.");
        closeAlert();
    }
}
