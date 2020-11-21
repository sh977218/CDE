package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteFormDraftTest extends NlmCdeBaseTest {
    @Test
    public void deleteFormDraft() {
        String formName = "Form Delete Test";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
        goToNamingForm();
        addNewDesignation("draft designation", new String[]{"Health"});
        addNewDefinition("draft definition", false, new String[]{"Health"});
        textPresent("Draft");
        deleteDraft();
        textNotPresent("Draft");
        textNotPresent("draft definition");
    }
}
