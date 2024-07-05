package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchSettingsTest extends NlmCdeBaseTest {

    void setAndCheckFields() {
        clickElement(By.id("browseOrg-NINDS"));
        textNotPresent("Other Names");
        textNotPresent("Permissible Values");
        textNotPresent("Admin Status");
        textNotPresent("Identifiers");

        clickElement(By.id("list_gridView"));
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Question Texts");
        textPresent("Used By");
        textPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
        textNotPresent("Other Names");
        textNotPresent("NLM ID");


        clickElement(By.id("tableViewSettings"));
        textPresent("Table View Fields");
        clickElement(By.id("tinyId"));
        clickElement(By.id("registrationStatus"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("naming"));
        closeTableViewPreferenceModal();

        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used By");
        textPresent("NLM ID");
        textNotPresent("Registration Status", By.id("gridList"));
        textPresent("Identifiers");
    }

    @Test
    void unloggedUserSetsFields() {
        goToCdeSearch();
        setAndCheckFields();

        //The following just tests that clearStorage() works
        clearStorage();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("list_gridView"));
        textPresent("Question Texts");
        textNotPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used By");
        textPresent("Registration Status");
        textPresent("Identifiers");
    }

}
