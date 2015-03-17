package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;
import com.jayway.restassured.RestAssured;

public class AttachmentsTest extends BaseAttachmentTest {

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
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();           
        checkAttachmentNotReviewed();
        reviewAttachment("glass.jpg");

        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();    

        goToCdeByName(cdeName);
        checkAttachmentReviewed("glass.jpg");
        
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
        
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);

        addAttachment("melanoma.jpg");
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();           
        checkAttachmentNotReviewed();
        reviewAttachment("melanoma.jpg");
        
        hangon(5);
        
        openFormInList(formName);

        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.linkText("View Full Detail")).click();
        
        mustBeLoggedInAs(ctep_fileCurator_username, password);
        goToFormByName(formName);
        removeAttachment();
    }   

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Sedative sleep pill frequency";        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");

        addAttachment("painLocationInapr.png");
        checkAttachmentNotReviewed();
        declineAttachment();

        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("glass.jpg");
    }   

}
