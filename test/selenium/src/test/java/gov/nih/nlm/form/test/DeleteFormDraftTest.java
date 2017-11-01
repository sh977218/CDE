package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteFormDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteFormDraft() {
        String formName = "Form Delete Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToNaming();
        addNewName("draft designation", "draft definition", false, new String[]{"Health"});
        textPresent("Draft");
        clickElement(By.id("deleteDraftBtn"));
        textNotPresent("Draft");
        textNotPresent("draft definition");
    }
}
