package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.jayway.restassured.RestAssured;

public class AttachmentsTest extends NlmCdeBaseTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Alcohol use frequency";
        
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");
        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        addAttachment();
        checkAttachmentNotReviewed();
        reviewAttachment();

        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();    

        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        findElement(By.linkText("glass.jpg")).click();
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);
        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
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
        reviewAttachment();
        
        hangon(5);
        
        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.linkText("View Full Detail")).click();
        
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
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


        textPresent("Attachment Approval");
        findElement(By.cssSelector(".accordion-toggle")).click();        

        String preClass = "";
        try {
            textPresent("glass.jpg");
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            findElement(By.cssSelector(preClass+".accordion-toggle")).click();
            textPresent("glass.jpg");
        }

        findElement(By.cssSelector(preClass+".approveAttachment")).click();
        textPresent("Attachment approved");  
              
    } 

    private void declineAttachment() {
        mustBeLoggedInAs(attachmentReviewer_username, password);       
        gotoInbox();


        textPresent("Attachment Approval");
        findElement(By.cssSelector(".accordion-toggle")).click();        

        String preClass = "";
        try {
            textPresent("glass.jpg");
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            findElement(By.cssSelector(preClass+".accordion-toggle")).click();
            textPresent("glass.jpg");
        }

        findElement(By.cssSelector(preClass+".declineAttachment")).click();
        textPresent("Attachment declined");  
              
    }     

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Sedative sleep pill frequency";        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();


        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");

        addAttachment();
        checkAttachmentNotReviewed();
        declineAttachment();

        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("glass.jpg");
    }   

}
