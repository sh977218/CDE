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
        hangon(3);
        textNotPresent("Possible Matches");
        findElement(By.name("elt.designation")).sendKeys("10");
        hangon(3);
        textNotPresent("Possible Matches");
        findElement(By.name("elt.designation")).clear();
        findElement(By.name("elt.designation")).sendKeys("ind");
        hangon(3);
        textPresent("Possible Matches");
        textPresent("Smoking History Ind");
    }
}
