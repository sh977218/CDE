package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class MaliciousAttachment  extends BaseAttachmentTest {

    @Test
    public void uploadMaliciousAttachment() {
        String cde = "Stasis dilation upper urinary tract indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cde);

        showAllTabs();
        clickElement(By.id("attachments_tab"));
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\fakeVirus.txt");
        clickElement(By.id("doUploadButton"));
        textPresent("The file probably contains a virus");
        textNotPresent("Filename");
    }

}
