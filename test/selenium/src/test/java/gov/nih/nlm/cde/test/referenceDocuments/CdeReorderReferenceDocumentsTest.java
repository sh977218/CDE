package gov.nih.nlm.cde.test.referenceDocuments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeReorderReferenceDocumentsTest extends NlmCdeBaseTest {
    @Test
    public void cdeReorderReferenceDocuments() {
        String cdeName = "Reorder reference document cde";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToReferenceDocuments();
        reorderBySection("reference-documents", "down", 0);
        textPresent("rd1", By.cssSelector("[itemprop='id_1']"));
        reorderBySection("reference-documents", "down", 1);
        textPresent("rd3", By.cssSelector("[itemprop='id_1']"));
        reorderBySection("reference-documents", "top", 2);
        textPresent("rd1", By.cssSelector("[itemprop='id_0']"));
    }
}
