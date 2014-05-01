package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

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
        loginAs(ctepCurator_username, ctepCurator_password);
        gotoInbox();
    }    
  
    @Test
    public void merge() {
        createMergeRequest();
        acceptMergeRequest();
        hangon(1000);
    }

}
