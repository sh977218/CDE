package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HomeTest extends NlmCdeBaseTest {

    @Test
    public void goToCdes() {
        goHome();
        clickElement(By.id("browseCdes"));
        textPresent("PBTC");
    }

    @Test
    public void goToForms() {
        goHome();
        clickElement(By.id("browseForms"));
        textPresent("Neuro-QOL");
    }


    @Test
    public void loggedInHomeIsSearch() {
        mustBeLoggedInAs(ctepCurator_username, password);
        driver.get(baseUrl);
        textPresent("Browse by classification");
    }

    @Test
    public void loggedOutHomeIsAbout() {
        mustBeLoggedOut();
        driver.get(baseUrl);
        textPresent("has been designed to provide access");
    }

}