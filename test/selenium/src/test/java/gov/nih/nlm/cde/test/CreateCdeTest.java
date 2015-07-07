package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateCdeTest extends BaseClassificationTest {
  
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

        addClassificationToNewCdeMethod(new String[]{"NINDS", "Disease", "Traumatic Brain Injury"});
        modalGone();
        textPresent("Traumatic Brain Injury");
        
        deleteClassification("classification-Disease,Traumatic Brain Injury");

        addClassificationToNewCdeMethod(new String[]{"NINDS", "Disease", "Headache"});

        checkRecentlyUsedClassificationsForNewCde(new String[]{"NINDS", "Disease", "Headache"});
        
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
    
}
