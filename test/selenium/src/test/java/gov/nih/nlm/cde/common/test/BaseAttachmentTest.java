package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;

public class BaseAttachmentTest extends NlmCdeBaseTest {

    protected void removeAttachment() {
        removeAttachment("glass.jpg");
    }

    protected void removeAttachment(String name) {        
        findElement(By.linkText("Attachments")).click();
        findElement(By.id("removeAttachment-0")).click();
        findElement(By.id("confirmRemove-0")).click();        
        textNotPresent(name);
    }

    protected void addAttachment() {
        addAttachment("glass.jpg");
    }
    
    protected void addAttachment(String name) {
        findElement(By.linkText("Attachments")).click();
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("S:\\CDE\\data\\"+name);
        findElement(By.id("doUploadButton")).click();

        textPresent(name);             
    }
    
    protected void checkAttachmentNotReviewed() {     
        textPresent("cannot be dowloaded");                     
    }

    protected void checkAttachmentReviewed(String name){        
        findElement(By.linkText("Attachments")).click();
        findElement(By.linkText(name)).click();
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);        
    }

    protected void reviewAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();

        textPresent("Attachment Approval");
        findElement(By.xpath("//div[@id='mail_received']//a[1]")).click();

        String preClass = "";
        try {
            textPresent(name);
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            findElement(By.cssSelector(preClass+".accordion-toggle")).click();
            textPresent(name);
        }
        textPresent("Scanned");
        findElement(By.cssSelector(preClass+".approveAttachment")).click();
        textPresent("Attachment approved");  
              
    } 

    protected void declineAttachment() {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();


        textPresent("Attachment Approval");
        findElement(By.cssSelector(".accordion-toggle")).click();        

        String preClass = "";
        try {
            textPresent("painLocationInapr.png");
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            findElement(By.cssSelector(preClass+".accordion-toggle")).click();
            textPresent("painLocationInapr.png");
        }

        findElement(By.cssSelector(preClass+".declineAttachment")).click();
        textPresent("Attachment declined");  
              
    }

    public void setAttachmentDefault() {
        findElement(By.linkText("Attachments")).click();
        textPresent("Upload more files");
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();
    }
}
