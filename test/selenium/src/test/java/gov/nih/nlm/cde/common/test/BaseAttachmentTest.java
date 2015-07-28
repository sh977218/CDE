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
        hangon(1);
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);        
    }

    protected void reviewAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();

        textPresent("Attachment Approval");
        findElement(By.xpath("//span[contains(text(), '" + name + "')]")).click();

        findElement(By.linkText(name));
        textPresent("Scanned by ClamAV");
        findElement(By.id("approve-" + name)).click();
        textPresent("Attachment approved");
        closeAlert();
              
    } 

    protected void declineAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();


        textPresent("Attachment Approval");
        findElement(By.xpath("//span[contains(text(), '" + name + "')]")).click();

        findElement(By.linkText(name));
        textPresent("Scanned by ClamAV");

        findElement(By.id("decline-" + name)).click();
        textPresent("Attachment declined");
        closeAlert();
    }

    public void setAttachmentDefault() {
        findElement(By.linkText("Attachments")).click();
        textPresent("Upload more files");
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();
    }
}
