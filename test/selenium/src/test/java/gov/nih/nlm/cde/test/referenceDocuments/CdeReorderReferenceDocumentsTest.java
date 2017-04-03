package gov.nih.nlm.cde.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderReferenceDocumentsTest extends NlmCdeBaseTest {
    @Test
    public void cdeReorderReferenceDocuments() {
        String cdeName = "cde for test cde reorder detail tabs";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);

        clickElement(By.id("referenceDocument_tab"));
        clickElement(By.id("moveDown-0"));
        textPresent("rd1", By.id("id_1"));
        clickElement(By.id("moveDown-2"));
        textPresent("rd3", By.id("id_1"));
        clickElement(By.id("moveDown-2"));
        textPresent("rd1", By.id("id_0"));
    }
}
