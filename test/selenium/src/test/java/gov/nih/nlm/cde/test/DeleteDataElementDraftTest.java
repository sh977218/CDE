package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteDataElementDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteDataElementDraft() {
        String cdeName = "Cde Delete Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToNaming();
        addNewName("draft designation", "draft definition", false, new String[]{"Health"});
        textPresent("Draft");
        deleteDraft();
        textNotPresent("Draft");
        textNotPresent("draft definition");
    }
}
