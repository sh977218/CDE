package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClearClassificationFilters extends NlmCdeBaseTest {

    @Test
    public void clearClassificationFiltersTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        clickElement(By.id("classif-CATEGORY"));
        textPresent("AdEERS");
        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("SPOREs");
        clickElement(By.id("classif-CTEP"));
        clickElement(By.id("classif-DISEASE"));
        textPresent("Bladder");
        scrollToTop();

        clickElement(By.id("regstatus-Qualified"));
        clickElement(By.id("datatype-Number"));

        assertSearchFilterSelected("classif-CTEP", true);
        assertSearchFilterSelected("classif-DISEASE", true);
        assertSearchFilterSelected("regstatus-Qualified", true);
        assertSearchFilterSelected("datatype-Number", true);
        textPresent("4 results");
        textNotPresent("ATRA", By.id("classificationListHolder"));

        clickElement(By.id("nihEndorsedCheckbox"));

        textPresent("No results were found");

        clickElement(By.className("clearAllPill"));

        assertSearchFilterSelected("classif-CTEP", false);
        assertSearchFilterSelected("regstatus-Qualified", false);
        assertSearchFilterSelected("datatype-Number", false);

        textPresent("Search CDEs");
    }
}
