package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.*;
import org.testng.annotations.Test;

public class SearchSettingsTest extends NlmCdeBaseTest {

    void setAndCheckFields(){
        findElement(By.id("browseOrg-NINDS")).click();
        textNotPresent("Other Names");
        textNotPresent("Permissible Values");
        textNotPresent("Admin Status");
        textNotPresent("Identifiers");

        findElement(By.id("cde_gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");

        // TODO edit this
        findElement(By.id("searchSettings")).click();
        textPresent("Search Results View");
        textPresent("Table View Fields");
        textPresent("Search Results View");
        findElement(By.id("registrationStatus")).click();
        findElement(By.id("administrativeStatus")).click();
        findElement(By.id("tinyId")).click();

        clickElement(By.id("saveSettings"));
        textPresent("Settings saved");
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        findElement(By.id("cde_gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("NLM ID");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }


    @Test
    void unloggedUserSetsFields (){
        mustBeLoggedOut();
        goToCdeSearch();
        setAndCheckFields();

        //The following just tests that clearStorage() works
        clearStorage();
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        findElement(By.id("cde_gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("Registration Status");
        textPresent("Identifiers");
    }

    @Test
    @RecordVideo
    void loggedUserSetsFields() {
        mustBeLoggedInAs(tableViewUser_username, password);
        goToCdeSearch();
        setAndCheckFields();
        clearStorage();
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        findElement(By.id("cde_gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }
}
