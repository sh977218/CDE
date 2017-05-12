package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class PrefStdFacets extends NlmCdeBaseTest {

    @Test
    public void preferredStandardFacet() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String cdeName = "Noncompliant Reason Text";
        goToCdeByName(cdeName);


        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        textPresent("Standard elements cannot be edited by their stewards");
        clickElement(By.id("saveRegStatus"));
        textPresent("Saved");
        closeAlert();
        waitForESUpdate();
        goToCdeSearch();
        clickElement(By.id("browseOrg-DCP"));
        textPresent("Preferred Standard (");
        clickElement(By.id("li-blank-Standard"));
        textNotPresent(cdeName);
    }

}
