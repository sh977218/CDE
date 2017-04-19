package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MaliciousAttachment  extends BaseAttachmentTest {

    private void tryAgain(int ttl) {
        if (ttl == 0) Assert.fail("Fail to recognize virus");

        String cde = "Stasis dilation upper urinary tract indicator";
        goToCdeByName(cde);

        clickElement(By.id("attachments_tab"));
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\fakeVirus.txt");
        try {
            textPresent("The file probably contains a virus");
        } catch (Exception e) {
            // this randomly fails every 5 times.
            tryAgain(ttl - 1);
        }
    }

    @Test
    public void uploadMaliciousAttachment() {
        mustBeLoggedInAs(ninds_username, password);
        tryAgain(3);
    }

}
