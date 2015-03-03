package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MergeTest extends NlmCdeBaseTest {
    
    private void checkEverything() {
        findElement(By.xpath("//input[@ng-model='mergeRequest.mergeFields.ids']")).click();  
        findElement(By.xpath("//input[@ng-model='mergeRequest.mergeFields.attachments']")).click();  
        findElement(By.xpath("//input[@ng-model='mergeRequest.mergeFields.properties']")).click();  
        findElement(By.xpath("//input[@ng-model='mergeRequest.mergeFields.naming']")).click();     
    }
    
    private void createMergeRequest() { 
        mustBeLoggedInAs(cabigAdmin_username, password);
        addToCompare("Smoking Cessation Other Method Specify Text", "Smoking History Ind");
        findElement(By.linkText("Retire & Merge")).click();  
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        checkEverything();
        findElement(By.cssSelector("[ng-click='sendMergeRequest()']")).click(); 
        hangon(1);
    }
    
    
    private void acceptMergeRequest() {
        mustBeLoggedInAs(ctepCurator_username, password);
        gotoInbox();
        findElement(By.cssSelector(".accordion-toggle")).click();  
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        Assert.assertTrue(textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned."));
        Assert.assertTrue(textPresent("3279225"));
        findElement(By.cssSelector("[ng-click='showMergeApproveDialog(message)']")).click();
        findElement(By.cssSelector("[ng-model='elt.version']")).sendKeys(".2");
        hangon(2);
        findElement(By.cssSelector("#confirmNewVersion")).click();         
        hangon(6); 
    }    
    
    private void checkResult() {     
        findElement(By.cssSelector(".accordion-toggle")).click(); 
        if (!browser.equals("ie")) {
            findElement(By.linkText("Smoking History Ind")).click(); 
            switchTabAndClose(1);
        } else goToCdeByName("Smoking History Ind");
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("Health Survey"));          
        Assert.assertTrue(textPresent("Cancer Related Risks"));
        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned."));   
        findElement(By.linkText("Identifiers")).click();
        Assert.assertTrue(textPresent("3279225"));
    }
    
    @Test
    public void mergeMineMineEverything() {
        mustBeLoggedInAs(ctepCurator_username, password);
        addToCompare("Common Toxicity Criteria Adverse Event Colitis Grade", "Common Toxicity Criteria Adverse Event Hypophosphatemia Grade");
        findElement(By.id("retireMerge-0")).click(); 
        textPresent("Common Toxicity Criteria Adverse Event Colitis Grade");
        checkEverything();
        findElement(By.id("sendMergeRequest")).click();
        findElement(By.cssSelector("[ng-model='elt.version']")).sendKeys(".2");
        hangon(3);
        findElement(By.cssSelector("#confirmNewVersion")).click(); 
        hangon(5);
        findElement(By.linkText("Naming")).click();
        textPresent("Common Toxicity Criteria Adverse Event Colitis Grade");
        findElement(By.linkText("Classification")).click();
        textPresent("Common Terminology Criteria for Adverse Events v3.0");
        findElement(By.linkText("Identifiers")).click();
        textPresent("2005490");        
    }    
    
    @Test
    public void mergeMineTheirsClassificationsOnly() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        addToCompare("Diagnosis Change Date java.util.Date", "Form Element End Date java.util.Date");
        hangon(1);
        findElement(By.linkText("Retire & Merge")).click();  
        Assert.assertTrue(textPresent("Fields to be Imported"));
        findElement(By.cssSelector("[ng-click='sendMergeRequest()']")).click();
        hangon(1);
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("caBIG"));
        Assert.assertTrue(textPresent("caLIMS2"));      
        Assert.assertTrue(textPresent("gov.nih.nci.calims2.domain.inventory"));    
    }    
  
    @Test
    public void mergeMineTheirsEverything() {
        createMergeRequest();
        acceptMergeRequest();
        checkResult();        
    }

}
