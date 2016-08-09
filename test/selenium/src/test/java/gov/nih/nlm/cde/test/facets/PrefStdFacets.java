package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class PrefStdFacets extends NlmCdeBaseTest {

    @Test
    public void preferredStandardFacet() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Noncompliant Reason Text");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        clickElement(By.id("saveRegStatus"));
        waitForESUpdate();
        goToCdeSearch();
        searchElt("Noncompliant Reason Text", "cde");
        textPresent("Preferred Standard (");
        wait.until(ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated(By.id("li-blank-Standard"))));
    }

}
