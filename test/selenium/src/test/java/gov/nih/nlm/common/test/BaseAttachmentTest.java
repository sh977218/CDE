package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;

public class BaseAttachmentTest extends NlmCdeBaseTest {

    protected void removeAttachment(String name) {
        clickElement(By.id("attachments_tab"));
        clickElement(By.xpath("//div[contains(@id, 'attachment_')][//a[.='" + name + "']]//i[contains(@id, 'removeAttachment')]"));
        clickElement(By.xpath("//div[contains(@id, 'attachment_')][//a[.='" + name + "']]//i[contains(@id, 'confirmRemove')]"));
        textPresent("Attachment Removed.");
        closeAlert();
        textNotPresent(name);
    }

    protected void addAttachment(String name) {
        clickElement(By.id("attachments_tab"));
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("$(\"input[type='file']\").show();");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\" + name);
//        clickElement(By.id("doUploadButton"));

        textPresent(name);
    }

    protected void checkAttachmentNotReviewed() {
        textPresent("cannot be downloaded");
    }

    protected void checkAttachmentReviewed(String name) {
        clickElement(By.id("attachments_tab"));
        clickElement(By.linkText(name));
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);
    }

    protected void reviewAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        gotoInbox();

        textPresent("attachment approval");
        clickElement(By.xpath("//span[contains(text(), '" + name + "')]"));

        findElement(By.linkText(name));
//        textPresent("Scanned by ClamAV");
        clickElement(By.id("approve-" + name));
        textPresent("Attachment approved");
        closeAlert();

    }

    protected void declineAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        gotoInbox();

        textPresent("attachment approval");
        clickElement(By.xpath("//span[contains(text(), '" + name + "')]"));

        findElement(By.linkText(name));
       // textPresent("Scanned by ClamAV");

        clickElement(By.id("decline-" + name));
        textPresent("Attachment declined");
        closeAlert();
    }

    public void setAttachmentDefault() {
        clickElement(By.id("attachments_tab"));
        textPresent("Upload more files");
        clickElement(By.id("defaultCbLabel"));
        textPresent("Saved");
        closeAlert();
    }
}
