package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeCreateTest extends NlmCdeBaseTest {
   
    public void createBasicCde(String name, String definition, String version, String org, String classification, String subclassification) {
        goToSearch();
        fillOutBasicCreateFields(name, definition, version, org, classification, subclassification);
        findElement(By.id("submit")).click();
        hangon(1);
    }    

    void fillOutBasicCreateFields(String name, String definition, String version, String org, String classification, String subClassification) {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        findElement(By.name("cde.designation")).sendKeys(name);
        findElement(By.name("cde.definition")).sendKeys(definition);
        if (version != null) {
            findElement(By.name("cde.version")).sendKeys(version);
        }
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText(org);
        
        classify(org, classification, subClassification);
    } 

    void classify(String org, String classification, String subClassification) {
        findElement(By.id("selectDefault")).click();
        modalHere();        
        findElement(By.id("classifySlectOrg-"+org)).click();
        hangon(0.5);   
        findElement(By.cssSelector("[id='addClassification-"+classification+"'] span.fake-link")).click();
        findElement(By.cssSelector("[id='addClassification-"+subClassification+"'] button")).click();
        findElement(By.cssSelector(".modal-dialog .done")).click();
        modalGone();    
    }   

    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goHome();
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        Assert.assertTrue(textPresent("Please enter a name"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("cde.designation")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please enter a definition"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        findElement(By.name("cde.definition")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please select a steward"));
        Assert.assertFalse(findElement(By.id("submit")).isEnabled());
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("NINDS");
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
        mustBeLoggedInAs("classificationMgtUser", "pass");
        String name = "Abracadabra";
        String definition = "Definition for testUser CDE 1";
        String version = "1.0alpha1";
        fillOutBasicCreateFields(name, definition, version, "CTEP", "Submission and Reporting", "Breast Cancer Data Mart");

        Assert.assertTrue(textPresent("Submission and Reporting"));
        Assert.assertTrue(textPresent("Breast Cancer Data Mart"));

        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("Select One");
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("NINDS");
        
        classify("NINDS", "Disease", "Traumatic Brain Injury");
        modalGone();
        Assert.assertTrue(textPresent("Traumatic Brain Injury"));
        findElement(By.xpath("//li[@id='classification-Disease,Traumatic Brain Injury']//a[@class='fa fa-trash-o']")).click();
        findElement(By.xpath("//li[@id='classification-Disease,Traumatic Brain Injury']//a[@class='fa fa-check']")).click();
        hangon(0.5);
        Assert.assertTrue(textNotPresent("Traumatic Brain Injury"));        
        
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
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        createBasicCde("AlignmentCDE", "Definition for alignment cde", null, "CTEP", "DISEASE", "Brain");

        goToSearch();
        openEltInList("AlignmentCDE");
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("ctepCurator"));
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
    }

    @Test
    public void createCdeSuggest() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("cde.designation")).sendKeys("10");
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("cde.designation")).clear();
        findElement(By.name("cde.designation")).sendKeys("ind");
        hangon(3);
        Assert.assertTrue(textPresent("Possible Matches"));
        Assert.assertTrue(textPresent("Smoking History Ind"));
    }
    
}
