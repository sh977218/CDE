package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAddRemoveNamingTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddRemoveNaming() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        String cdeName = "Principal Investigator State java.lang.String";
        String newName = "New Name";
        String newDefinition = "New Definition";
        String newNameChange = " Change";
        String newDefinitionChange = " Change";
        String newTag = "Health Changed";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        addNewName(newName, newDefinition, null);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newName);

        editDesignationByIndex(1, newNameChange);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newName + newNameChange);

        editDefinitionByIndex(1, newDefinitionChange, false);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newDefinition + newDefinitionChange);

        editTagByIndex(1, new String[]{newTag});
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newTag);

        clickElement(By.id("removeNaming-1"));
        newCdeVersion();

        textNotPresent(newName);

    }

}
