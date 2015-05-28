package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

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
