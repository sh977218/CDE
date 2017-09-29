package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteDraft() {
        String formName = "Form Delete Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("naming_tab"));
        addNewName("test", "test", new String[]{"test"});
        textPresent("Draft");
        clickElement(By.id("deleteDraftBtn"));
        textNotPresent("Draft");
    }
}
