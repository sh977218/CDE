package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreate2Test extends BaseClassificationTest {

    @Test
    public void testAlignmentForMissingFields() {
        mustBeLoggedInAs(ctepCurator_username, password);
        createBasicCde("AlignmentCDE", "Definition for alignment cde", "CTEP", "DISEASE", "Brain");
        try {
            openCdeInList("AlignmentCDE", "Incomplete");
        } catch (Exception e) {
            openCdeInList("AlignmentCDE", "Incomplete");
        }
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
        waitAndClick(By.linkText("View Full Detail"));
        textPresent("ctepCurator");
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
    }

    @Test
    public void createCdeSuggest() {
        mustBeLoggedInAs(ctepCurator_username, password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("elt.designation")).sendKeys("10");
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("elt.designation")).clear();
        findElement(By.name("elt.designation")).sendKeys("ind");
        hangon(3);
        Assert.assertTrue(textPresent("Possible Matches"));
        Assert.assertTrue(textPresent("Smoking History Ind"));
    }
}
