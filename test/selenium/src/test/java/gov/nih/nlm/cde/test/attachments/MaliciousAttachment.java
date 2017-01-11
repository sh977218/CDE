package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MaliciousAttachment  extends BaseAttachmentTest {

    private void tryAgain(int ttl) {
        if (ttl == 0) Assert.fail("Fail to recognize virus");


        clickElement(By.id("attachments_tab"));
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\fakeVirus.txt");
        clickElement(By.id("doUploadButton"));
        try {
            textPresent("The file probably contains a virus");
        } catch (Exception e) {
            // this randomly fails every 5 times.
            driver.get(driver.getCurrentUrl());
            tryAgain(ttl - 1);
        }
    }

    @Test
    public void uploadMaliciousAttachment() {
        String cde = "Stasis dilation upper urinary tract indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde);

        tryAgain(3);
    }

}
