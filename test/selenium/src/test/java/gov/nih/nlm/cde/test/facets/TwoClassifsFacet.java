package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifsFacet extends NlmCdeBaseTest {

    @Test
    public void twoOrgsNoClassif() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("CIP (1)");
        textPresent("NHLBI (");
        clickElement(By.id("classif-CIP"));
        textNotPresent("Person Birth Date");
        textPresent("1 results. Sorted by relevance.");
    }

}
