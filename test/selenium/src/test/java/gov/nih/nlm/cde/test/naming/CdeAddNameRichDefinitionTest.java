package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddNameRichDefinitionTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddNameRichDefinition() {
        String cdeName = "Urinary tract drug type last year type";
        String newName = "New Name";
        String newDefinition = "New <b>Definition</b>";
        String[] newTag = new String[]{"Health"};

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToNaming();
        addNewName(newName, newDefinition, true, newTag);
        newCdeVersion();

        goToCdeByName(cdeName);
        goToNaming();
        textPresent("New Definition");
    }
}
