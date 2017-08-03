package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeCreateSuggestionTest extends BaseClassificationTest {

    @Test
    public void cdeCreateSuggestion() {
        mustBeLoggedInAs(ctepCurator_username, password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        textPresent("Please enter a name for the new CDE");
        textNotPresent("Possible Matches");
        findElement(By.name("eltName")).sendKeys("10");
        hangon(3);
        textNotPresent("Possible Matches");
        findElement(By.name("eltName")).clear();
        findElement(By.name("eltName")).sendKeys("ind");
        textPresent("Possible Matches");
        textPresent("Smoking History Ind");
    }
}
