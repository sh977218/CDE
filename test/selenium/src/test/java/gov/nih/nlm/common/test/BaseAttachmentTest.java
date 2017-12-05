package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;

public class BaseAttachmentTest extends NlmCdeBaseTest {

    protected void removeAttachment(String name) {
        goToAttachments();
        clickElement(By.xpath("//*[contains(@id, 'attachment_')][//a[.='" + name + "']]//i[contains(@id, 'removeAttachment')]"));
        clickElement(By.xpath("//*[contains(@id, 'attachment_')][//a[.='" + name + "']]//i[contains(@id, 'confirmRemove')]"));
        textPresent("Attachment Removed.");
        closeAlert();
        textNotPresent(name);
    }

    protected void addAttachment(String name) {
        goToAttachments();
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("document.getElementById('fileToUpload').style.display = 'block';");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\" + name);
        textPresent(name);
    }

    protected void checkAttachmentNotReviewed() {
        textPresent("cannot be downloaded");
    }

    protected void checkAttachmentReviewed(String name) {
        goToAttachments();
        clickElement(By.linkText(name));
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);
    }

    protected void reviewAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        gotoInbox();

        textPresent("Attachment approval");
        clickElement(By.partialLinkText(name));

        findElement(By.linkText(name));
//        textPresent("Scanned by ClamAV");
        clickElement(By.id("approve-" + name));
        textPresent("Attachment approved");
        closeAlert();

    }

    protected void declineAttachment(String name) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        gotoInbox();

        textPresent("Attachment approval");
        clickElement(By.partialLinkText(name));

        findElement(By.linkText(name));
       // textPresent("Scanned by ClamAV");

        clickElement(By.id("decline-" + name));
        textPresent("Attachment declined");
        closeAlert();
    }

    public void setAttachmentDefault() {
        goToAttachments();
        textPresent("Upload more files");
        clickElement(By.id("defaultCbLabel"));
        textPresent("Saved");
        closeAlert();
    }
}
