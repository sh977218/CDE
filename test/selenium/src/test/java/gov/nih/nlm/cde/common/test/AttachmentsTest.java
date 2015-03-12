package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AttachmentsTest extends NlmCdeBaseTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Alcohol use frequency";
        
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");
        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");

        addAttachment();
        checkAttachmentNotReviewed();
        reviewAttachment();


        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();    
        
        removeAttachment();
    }
    
    @Test
    public void formAttachments() {
        String formName = "Skin Cancer Patient";
        
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");        
        
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);

        addAttachment();
        checkAttachmentNotReviewed();
        
        hangon(5);
        
        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.linkText("View Full Detail")).click();
        
        removeAttachment();
    }

    private void removeAttachment() {
    
        
        findElement(By.linkText("Attachments")).click();
        findElement(By.id("removeAttachment-0")).click();
        findElement(By.id("confirmRemove-0")).click();
        
        textNotPresent("glass.jpg");
    }
    
    private void addAttachment() {
        findElement(By.linkText("Attachments")).click();
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("S:/CDE/data/glass.jpg");
        findElement(By.id("doUploadButton")).click();

        Assert.assertEquals("1.38 kB", findElement(By.id("dd_attach_size_0")).getText());
        textPresent("glass.jpg");        
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();        
    }
    
    private void checkAttachmentNotReviewed() {
        findElement(By.cssSelector(".viewAttachmentLink")).click();
        switchTab(1);
        textPresent("This file has not been approved yet.");
        switchTabAndClose(0);        
    }

    private void reviewAttachment() {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();
    }    

}
