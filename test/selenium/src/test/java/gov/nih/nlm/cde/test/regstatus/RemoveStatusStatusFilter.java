
package gov.nih.nlm.cde.test.regstatus;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class RemoveStatusStatusFilter extends CdeRegStatusTest {

    @Test
    public void removeStatusStatusFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-PBTC"));
        textPresent("4 results. Sorted by relevance.");
        String viewing = findElement(By.id("linkToElt_0")).getText();
        clickElement(By.id("linkToElt_0"));

        textPresent("More Like This");
        textPresent(viewing);

        editRegistrationStatus("Preferred Standard", null, null, null, null);
        newCdeVersion();
        waitForESUpdate();
        driver.navigate().back();
        showSearchFilters();
        hangon(1);
        try {
            clickElement(By.id("regstatus-Preferred Standard"));
        } catch (TimeoutException e) {
            goToCdeSearch();
            clickElement(By.id("browseOrg-PBTC"));
            showSearchFilters();
            clickElement(By.id("regstatus-Preferred Standard"));
        }
        textPresent("1 results. Sorted by relevance.");
        clickElement(By.id("linkToElt_0"));

        textPresent("More Like This");
        textPresent(viewing);

        editRegistrationStatus("Standard", null, null, null, null);
        newCdeVersion();
        waitForESUpdate();
        goToCdeSearch();
        clickElement(By.id("browseOrg-PBTC"));
        textPresent("4 results. Sorted by relevance.");
    }

}
