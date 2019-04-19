package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoggedUserSetsFields extends NlmCdeBaseTest {

    SearchSettingsTest searchSettingsTest = new SearchSettingsTest();

    @Test
    void loggedUserSetsFields() {
        mustBeLoggedInAs(tableViewUser_username, password);
        goToCdeSearch();
        searchSettingsTest.setAndCheckFields();
        clearStorage();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("list_gridView"));
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }

}
