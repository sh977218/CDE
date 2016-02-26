package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NindsCannotSeeRetired extends NlmCdeBaseTest {

    @Test
    public void nindsCannotSeeRetired() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("Qualified (");
        textNotPresent("Retired (");
    }

}
