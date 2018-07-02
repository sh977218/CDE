package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeCreateSuggestionTest extends BaseClassificationTest {

    @Test
    public void cdeCreateSuggestion() {
        mustBeLoggedInAs(ctepCurator_username, password);
        clickElement(By.id("createEltLink"));
        clickElement(By.linkText("CDE"));
        // wait for page to load
        textPresent("Please enter a name for the new CDE");
        textNotPresent("Possible Matches");
        findElement(By.name("eltName")).sendKeys("ind");
        textPresent("Possible Matches");
        textPresent("Family Assessment Device (FAD) - Individually accept indicator");
    }
}
