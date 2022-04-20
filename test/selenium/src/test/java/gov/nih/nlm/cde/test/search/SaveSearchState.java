package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SaveSearchState extends NlmCdeBaseTest {

    @Test
    public void saveSearchState() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        textPresent("results for");
        int numRes = getNumberOfResults();
        clickElement(By.id("classif-CATEGORY"));
        textNotPresent(numRes + " data element results for");
        numRes = getNumberOfResults();
        clickElement(By.id("regstatus-Standard"));
        textNotPresent(numRes + " data element results for");
        clickElement(By.id("regstatus-Qualified"));
        scrollToTop();
        checkSearchResultInfo(null, "CTEP > CATEGORY", null, "Standard, Qualified", null);
        assertSearchFilterSelected("regstatus-Qualified", true);
        clickElement(By.id("regstatus-Qualified"));
        scrollToTop();
        checkSearchResultInfo(null, "CTEP > CATEGORY", null, "Standard", null);
        findElement(By.name("q")).sendKeys("name");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");
        clickElement(By.id("menu_forms_link"));
        hangon(1);
        textNotPresent("CATEGORY");
        driver.navigate().back();
        textPresent("CATEGORY");
        textPresent("No results were found.");
    }
}
