package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MyOrgIncomplete extends NlmCdeBaseTest {

    @Test
    public void myOrgIncompleteFacet() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("browseOrg-ONC"));
        textNotPresent("Incomplete (");

        loginAs("testAdmin", password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-ONC"));
        textPresent("Incomplete (");
        clickElement(By.id("status-text-Incomplete"));
        textPresent("Incomplete", By.id("searchResultInfoBar"));
        textPresent("Incomplete (" + getNumberOfResults());

        goToCdeSearch();
        clickElement(By.id("browseOrg-CIP"));
        textNotPresent("Incomplete (");
    }

}
