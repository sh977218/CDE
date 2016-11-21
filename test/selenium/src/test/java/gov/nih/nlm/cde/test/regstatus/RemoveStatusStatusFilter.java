
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
        textPresent("4 results for");
        String viewing = findElement(By.id("linkToElt_0")).getText();
        clickElement(By.id("linkToElt_0"));
        showAllTabs();
        textPresent("More Like This");
        textPresent(viewing);
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        // @TODO REMOVE
        waitForESUpdate();
        driver.navigate().back();
        showSearchFilters();
        hangon(1);
        try {
            clickElement(By.id("li-blank-Preferred Standard"));
        } catch (TimeoutException e) {
            goToCdeSearch();
            clickElement(By.id("browseOrg-PBTC"));
            showSearchFilters();
            clickElement(By.id("li-blank-Preferred Standard"));
        }
        textPresent("1 results for");
        clickElement(By.id("linkToElt_0"));
        showAllTabs();
        textPresent("More Like This");
        textPresent(viewing);
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Standard");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        waitForESUpdate();
        goToCdeSearch();
        clickElement(By.id("browseOrg-PBTC"));
        textPresent("4 results for");
    }

}
