package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MyOrgIncomplete extends NlmCdeBaseTest {

    @Test
    public void myOrgIncompleteFacet() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-ONC"));
        textNotPresent("Incomplete (");

        mustBeLoggedInAs(testEditor_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-ONC"));
        textPresent("Incomplete (");
        clickElement(By.xpath("//*[@id='regstatus-Incomplete']//a"));
        textPresent("Incomplete", By.id("searchResultInfoBar"));
        hangon(1);
        textPresent("Incomplete (" + getNumberOfResults());

        goToCdeSearch();
        clickElement(By.id("browseOrg-CIP"));
        textNotPresent("Incomplete (");
    }

}
