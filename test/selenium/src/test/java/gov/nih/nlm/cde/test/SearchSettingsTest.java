package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchSettingsTest extends NlmCdeBaseTest {

    void setAndCheckFields() {
        clickElement(By.id("browseOrg-NINDS"));
        textNotPresent("Other Names");
        textNotPresent("Permissible Values");
        textNotPresent("Admin Status");
        textNotPresent("Identifiers");

        clickElement(By.id("cde_gridView"));
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");

        clickElement(By.id("searchSettings"));
        textPresent("Search Results View");
        textPresent("Table View Fields");
        textPresent("Search Results View");
        clickElement(By.id("registrationStatus"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved");
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("cde_gridView"));
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }


    @Test
    void unloggedUserSetsFields() {
        mustBeLoggedOut();
        goToCdeSearch();
        setAndCheckFields();

        //The following just tests that clearStorage() works
        clearStorage();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("cde_gridView"));
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("Registration Status");
        textPresent("Identifiers");
    }

    @Test
    void loggedUserSetsFields() {
        mustBeLoggedInAs(tableViewUser_username, password);
        goToCdeSearch();
        setAndCheckFields();
        clearStorage();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("cde_gridView"));
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }
}
