package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PrefStdFacets extends NlmCdeBaseTest {

    @Test
    public void preferredStandardFacet() {
        String cdeName = "Noncompliant Reason Text";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("editStatus"));
        editRegistrationStatus("Preferred Standard", null, null, null, null);
        textPresent("Data Element saved.");
        closeAlert();
        waitForESUpdate();
        goToCdeSearch();
        clickElement(By.id("browseOrg-DCP"));
        textPresent("Preferred Standard (");
        clickElement(By.id("li-blank-Standard"));
        textNotPresent(cdeName);
    }

}
