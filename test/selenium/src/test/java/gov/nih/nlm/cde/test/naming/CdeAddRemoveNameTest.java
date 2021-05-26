package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddRemoveNameTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddRemoveName() {
        String cdeName = "Principal Investigator State java.lang.String";
        String newName = "New Name";
        String newDefinition = "New Definition";
        String newNameChange = " Change";
        String newDefinitionChange = " Change";
        String newTag = "Health Changed";

        mustBeLoggedInAs(cabigEditor_username, password);
        goToCdeByName(cdeName);
        goToNaming();
        addNewDesignation(newName, null);
        addNewDefinition(newDefinition, false, null);
        newCdeVersion();

        goToCdeByName(cdeName);
        goToNaming();
        textPresent(newName);
        editDesignationByIndex(1, newNameChange, null);
        newCdeVersion();

        goToCdeByName(cdeName);
        goToNaming();
        textPresent(newName + newNameChange);
        editDefinitionByIndex(1, newDefinitionChange, false);
        newCdeVersion();

        goToCdeByName(cdeName);
        goToNaming();
        clickElement(By.id("removeDesignation-1"));
        newCdeVersion();

        textNotPresent(newName);
    }
}
