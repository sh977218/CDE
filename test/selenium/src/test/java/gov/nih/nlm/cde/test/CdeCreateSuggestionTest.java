package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeCreateSuggestionTest extends BaseClassificationTest {

    @Test
    public void cdeCreateSuggestion() {
        mustBeLoggedInAs(ctepCurator_username, password);
        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createCDELink"));
        // wait for page to load
        textPresent("Please enter a name for the new CDE");
        textNotPresent("Possible Matches");
        findElement(By.name("eltName")).sendKeys("fad");
        textPresent("Possible Matches");
        textPresent("Family Assessment Device (FAD)");
    }
}
