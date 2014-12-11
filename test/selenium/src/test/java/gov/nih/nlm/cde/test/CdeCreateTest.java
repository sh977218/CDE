package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreateTest extends NlmCdeBaseTest {
   
    public void createBasicCde(String name, String definition, String version, String org, String classification, String subclassification) {
        goToCdeSearch();
        fillOutBasicCreateFields(name, definition, version, org, classification, subclassification);
        findElement(By.id("submit")).click();
        hangon(1);
    }    

    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goHome();
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        Assert.assertTrue(textPresent("Please enter a name"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.designation")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please enter a definition"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.definition")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please select a steward"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        Assert.assertTrue(textPresent("Please select at least one classification"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        classify("CTEP", "DISEASE", "Gynecologic");
        Assert.assertTrue(textPresent("Please select at least one classification owned by NINDS"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        classify("NINDS", "Population", "Adult");
        Assert.assertTrue(textNotPresent("Please"));
        Assert.assertTrue(findElement(By.id("submit")).isEnabled());
    }
    
    @Test
    public void createCde() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        String name = "Abracadabra";
        String definition = "Definition for testUser CDE 1";
        String version = "1.0alpha1";
        fillOutBasicCreateFields(name, definition, version, "CTEP", "Submission and Reporting", "Breast Cancer Data Mart");

        Assert.assertTrue(textPresent("Submission and Reporting"));
        Assert.assertTrue(textPresent("Breast Cancer Data Mart"));

        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("Select One");
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        
        classify("NINDS", "Disease", "Traumatic Brain Injury");
        modalGone();
        Assert.assertTrue(textPresent("Traumatic Brain Injury"));
        
        deleteClassification("classification-Disease,Traumatic Brain Injury");

        classify("NINDS", "Disease", "Headache");
   
        findElement(By.id("submit")).click();
        hangon(1);

        Assert.assertTrue(textPresent(definition));

        findElement(By.linkText("Classification")).click();
        
        Assert.assertTrue(textPresent("Submission and Reporting"));
        Assert.assertTrue(textPresent("Breast Cancer Data Mart"));        
        
        Assert.assertTrue(textPresent("Disease"));
        Assert.assertTrue(textPresent("Headache"));   

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals(version, findElement(By.id("dd_version_nlm")).getText());        
    }
    
    @Test
    public void testAlignmentForMissingFields() {
        mustBeLoggedInAs(ctepCurator_username, password);
        createBasicCde("AlignmentCDE", "Definition for alignment cde", null, "CTEP", "DISEASE", "Brain");

        goToCdeSearch();
        openCdeInList("AlignmentCDE", "Incomplete");
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("ctepCurator"));
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
