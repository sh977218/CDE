/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class FileUploadTest extends NlmCdeBaseTest {

    // These tests won't work because the upload button is (correctly) hidden,
    // but selenium cannot interact with a file Dialog, which is all there is to interact with...
    
//    @Test
    public void uploadFile() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        findElement(By.id("fileToUpload")).sendKeys(ClassLoader.getSystemResource("nlm.jpeg").getFile());
        findElement(By.id("doUploadButton")).click();
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        Assert.assertTrue(textPresent("nlm.jpeg"));
        Assert.assertTrue(textPresent("14861"));
        logout();                
    }
    
//    @Test
    public void removeAttachment() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Medical Device Manufacturer Name");
        findElement(By.linkText("Attachments")).click();
        findElement(By.id("fileToUpload")).sendKeys(ClassLoader.getSystemResource("nlm.jpeg").getFile());
        findElement(By.id("doUploadButton")).click();
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        Assert.assertTrue(textPresent("nlm.jpeg"));
        Assert.assertTrue(textPresent("14861"));
        findElement(By.id("removeAttachment-0")).click();
        findElement(By.id("confirmRemove-0")).click();
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("nlm.jpeg") < 0);
        logout();
    }
}
