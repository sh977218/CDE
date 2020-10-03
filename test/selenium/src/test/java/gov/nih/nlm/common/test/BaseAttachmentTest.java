package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;

public class BaseAttachmentTest extends NlmCdeBaseTest {

    protected void removeAttachment(String name) {
        goToAttachments();
        deleteWithConfirm("//*[contains(@id, 'attachment_')][//a[.='" + name + "']]");
        checkAlert("Attachment Removed.");
        textNotPresent(name);
    }

    protected void addAttachment(String name) {
        textPresent("Upload more files");
        ((JavascriptExecutor) driver).executeScript("document.getElementById('fileToUpload').style.display = 'block';");
        findElement(By.id("fileToUpload")).sendKeys("T:\\CDE\\data\\" + name);
        textPresent(name);
    }

    protected void checkAttachmentReviewed(String name) {
        goToAttachments();
        clickElement(By.linkText(name));
        switchTab(1);
        textNotPresent("File not found");
        textNotPresent("This file has not been approved yet");
        switchTabAndClose(0);
    }

    protected void reviewAttachment(String fileName) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        clickElement(By.id("notificationLink"));
        clickElement(By.xpath("//div[contains(@class, 'taskItem')][*//div[contains(text(),'" + fileName
                + "')]]//button[*[contains(text(),'Approve')]]"));
        checkAlert("Attachment approved");
    }

    protected void declineAttachment(String fileName) {
        mustBeLoggedInAs(attachmentReviewer_username, password);
        clickElement(By.id("notificationLink"));
        clickElement(By.xpath("//div[contains(@class, 'taskItem')][*//div[contains(text(),'" + fileName
                + "')]]//button[*[contains(text(),'Reject')]]"));
    }

    public void setAttachmentDefault() {
        goToAttachments();
        textPresent("Upload more files");
        clickElement(By.id("defaultCbLabel"));
        checkAlert("Saved");
    }
}
