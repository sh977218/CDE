package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreateTest extends BaseClassificationTest {
   
    public void createBasicCde(String name, String definition, String org, String classification, String subclassification) {
        goToCdeSearch();
        fillOutBasicCreateFields(name, definition, org, classification, subclassification);
        findElement(By.id("submit")).click();
        hangon(6);
    }    

    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goHome();
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        textPresent("Please enter a name");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.designation")).sendKeys("abc");
        textPresent("Please enter a definition");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("elt.definition")).sendKeys("abc");
        textPresent("Please select a steward");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        textPresent("Please select at least one classification");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationMethod(new String[]{"CTEP", "DISEASE", "Gynecologic"});
        textPresent("Please select at least one classification owned by NINDS");
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        addClassificationMethod(new String[]{"NINDS", "Population", "Adult"});
        textNotPresent("Please");
        Assert.assertTrue(findElement(By.id("submit")).isEnabled());
    }
    
    @Test
    public void createCde() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        String name = "Abracadabra";
        String definition = "Definition for testUser CDE 1";
        fillOutBasicCreateFields(name, definition, "CTEP", "Submission and Reporting", "Breast Cancer Data Mart");

        textPresent("Submission and Reporting");
        textPresent("Breast Cancer Data Mart");

        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("Select One");
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");

        addClassificationMethod(new String[]{"NINDS", "Disease", "Traumatic Brain Injury"});
        modalGone();
        textPresent("Traumatic Brain Injury");
        
        deleteClassification("classification-Disease,Traumatic Brain Injury");

        addClassificationMethod(new String[]{"NINDS", "Disease", "Headache"});        
        
        checkRecentlyUsedClassifications(new String[]{"NINDS", "Disease", "Headache"});
        
        findElement(By.id("submit")).click();
        hangon(1);

        textPresent(definition);

        findElement(By.linkText("Classification")).click();
        
        textPresent("Submission and Reporting");
        textPresent("Breast Cancer Data Mart");        
        
        textPresent("Disease");
        textPresent("Headache");   

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals("", findElement(By.id("dd_version_nlm")).getText());        
    }
    
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
        findElement(By.linkText("View Full Detail")).click();
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
