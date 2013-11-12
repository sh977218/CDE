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
            
    @Test
    public void uploadFile() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        findElement(By.id("fileToUpload")).sendKeys(ClassLoader.getSystemResource("nlm.jpeg").getFile());
        String fileURI = ClassLoader.getSystemResource("nlm.jpeg").getFile();
        findElement(By.id("doUploadButton")).click();
        goToCdeByName("Surgical Procedure Pelvis Drainage Removed Date");
        findElement(By.linkText("Attachments")).click();
        Assert.assertTrue(textPresent("nlm.jpeg"));
        Assert.assertTrue(textPresent("14861"));
        logout();                
    }
}
