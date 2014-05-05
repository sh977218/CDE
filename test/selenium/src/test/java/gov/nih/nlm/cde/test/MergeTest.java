package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import java.util.ArrayList;

public class MergeTest extends NlmCdeBaseTest {
    
    private void createMergeRequest() { 
        loginAs(cabigAdmin_username, cabigAdmin_password);
        addToCompare("Smoking Cessation Other Method Specify Text", "Smoking History Ind");
        findElement(By.linkText("Retire & Merge")).click();  
        modalHere();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        findElement(By.cssSelector("[ng-model='mergeRequest.fields.ids']")).click();  
        findElement(By.cssSelector("[ng-model='mergeRequest.fields.attachments']")).click();  
        findElement(By.cssSelector("[ng-model='mergeRequest.fields.properties']")).click();  
        findElement(By.cssSelector("[ng-model='mergeRequest.fields.naming']")).click();  
        findElement(By.cssSelector("[ng-click='sendMergeRequest()']")).click(); 
        hangon(1);
    }
    
    private void gotoInbox(){
        findElement(By.id("username_link")).click();  
        findElement(By.linkText("Inbox")).click();    
    }
    
    private void acceptMergeRequest() {
        logout();
        loginAs(ctepCurator_username, ctepCurator_password);
        gotoInbox();
        findElement(By.cssSelector(".accordion-toggle")).click();  
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        Assert.assertTrue(textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned."));
        Assert.assertTrue(textPresent("3279225"));
        findElement(By.cssSelector("[ng-click='showMergeApproveDialog(message)']")).click();
        findElement(By.cssSelector("[ng-model='cde.version']")).sendKeys(".2");
        findElement(By.cssSelector("#confirmSave")).click();         
        hangon(3); 
    }    
    
    private void checkResult() {
        findElement(By.linkText("Smoking History Ind")).click(); 
        switchTab(1);
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("Health Survey"));          
        Assert.assertTrue(textPresent("Cancer Related Risks"));
        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned."));   
        findElement(By.linkText("Identifiers")).click();
        Assert.assertTrue(textPresent("3279225"));
    }
    
    private void switchTab(int i) {
        ArrayList<String> tabs2 = new ArrayList<String> (driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs2.get(i));
    }
  
    @Test
    public void merge() {
        createMergeRequest();
        acceptMergeRequest();
        checkResult();
        
    }

}
