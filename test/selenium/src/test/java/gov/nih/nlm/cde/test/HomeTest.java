package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HomeTest extends NlmCdeBaseTest {

    @Test
    public void testSearch() {
        goHome();
        findElement(By.id("searchTerms")).sendKeys("\"Orientation Person\"");
        findElement(By.id("quickSearchButton")).click();
        textPresent("Orientation person result");
    }

    @Test
    public void loggedInHomeIsSearch() {
        mustBeLoggedInAs(ctepCurator_username, password);
        driver.get(baseUrl);
        textPresent(" | All Statuses");
    }

    @Test
    public void loggedOutHomeIsAbout() {
        mustBeLoggedOut();
        driver.get(baseUrl);
        textPresent("has been designed to provide access");
    }

}