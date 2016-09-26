package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreate2Test extends BaseClassificationTest {

    @Test(priority = 3)
    public void createCdeSuggest() {
        mustBeLoggedInAs(ctepCurator_username, password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        textPresent("Please enter a name for the new CDE");
        textNotPresent("Possible Matches");
        findElement(By.name("elt.designation")).sendKeys("10");
        hangon(3);
        textNotPresent("Possible Matches");
        findElement(By.name("elt.designation")).clear();
        findElement(By.name("elt.designation")).sendKeys("ind");
        textPresent("Possible Matches");
        textPresent("Smoking History Ind");
    }
}
