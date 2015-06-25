package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.*;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchSettingsTest extends NlmCdeBaseTest {

    void setAndCheckFields(){
        textNotPresent("Other Names");
        textNotPresent("Permissible Values");
        textNotPresent("Steward");
        textNotPresent("Used by Organizations");
        textNotPresent("Registration Status", By.id("gridList"));
        textNotPresent("Admin Status");
        textNotPresent("Identifiers");

        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");

        findElement(By.id("searchSettings")).click();
        textPresent("Search Results View");
        textPresent("Table View Fields");
        textPresent("Search Results View");
        findElement(By.id("registrationStatus")).click();
        findElement(By.id("administrativeStatus")).click();
        scrollTo(1000);
        findElement(By.id("saveSettings")).click();

        goToSearch("cde");
        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }


    @Test
    void UnloggedUserSetsFields (){
        mustBeLoggedOut();
        goToSearch("cde");
        setAndCheckFields();

        //The following just tests that clearStorage() works
        clearStorage();
        goToSearch("cde");
        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textPresent("Registration Status");
        textPresent("Identifiers");
    }

    @Test
    void LoggedUserSetsFields() {
        mustBeLoggedInAs(tableViewUser_username, password);
        goToSearch("cde");
        setAndCheckFields();
        clearStorage();
        goToSearch("cde");
        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }
}
