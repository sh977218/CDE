package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSearchExcludeTest extends NlmCdeBaseTest {

    @Test
    public void searchOneExclude() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG");
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("classif-caBIG"));
        textNotPresent("caBIG", By.id("resultList"));
    }

    @Test
    public void searchTwoExclude() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG");
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("classif-caBIG"));
        textNotPresent("caBIG", By.id("resultList"));
        clickElement(By.id("classif-ONC"));
        textNotPresent("ONC", By.id("resultList"));
    }

    @Test
    public void searchAllExclude() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG", By.id("resultList"));
        textPresent("ONC", By.id("resultList"));
        textPresent("CTEP", By.id("resultList"));
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("exludeAllOrgs"));
        textNotPresent("caBIG", By.id("resultList"));
        textNotPresent("ONC", By.id("resultList"));
        textNotPresent("CTEP", By.id("resultList"));
    }

}