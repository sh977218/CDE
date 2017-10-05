package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteDataElementDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteDataElementDraft() {
        String cdeName = "Cde Delete Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(cdeName);
        clickElement(By.id("naming_tab"));
        addNewName("draft designation", "draft definition", new String[]{"Health"});
        textPresent("Draft");
        clickElement(By.id("deleteDraftBtn"));
        textNotPresent("Draft");
        textNotPresent("draft definition");
    }
}
