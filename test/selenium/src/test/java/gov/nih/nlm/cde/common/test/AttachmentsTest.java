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
        
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");
        
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToCdeByName("Alcohol use frequency");

        addAttachment();

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.xpath("//a[@id='openCdeInCurrentTab_0']")).click();    
        
        removeAttachment();
    }
    
    @Test
    public void formAttachments() {
        String formName = "Skin Cancer Patient";
        
        mustBeLoggedInAs(ninds_username, ninds_password);
        goToFormByName(formName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");        
        
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(formName);

        addAttachment();
        
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
        findElement(By.id("fileToUpload")).sendKeys(System.getProperty("user.dir") + "/data/glass.jpg");
        findElement(By.id("doUploadButton")).click();

        Assert.assertEquals("1.38 kB", findElement(By.id("dd_attach_size_0")).getText());
        textPresent("glass.jpg");        
        findElement(By.id("defaultCbLabel")).click();
        textPresent("Saved");
        closeAlert();        
    }
    
}
