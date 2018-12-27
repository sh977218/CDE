package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAttachmentTest extends BaseAttachmentTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Family Assessment Device (FAD) - Discuss problem indicator";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        goToAttachments();
        textNotPresent("Upload more files");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        addAttachment("glass.jpg");
        textPresent("cannot be downloaded");

        logout();
        mustBeLoggedInAs(attachmentReviewer_username, password);

        goToCdeByName(cdeName);
        goToAttachments();
        findElement(By.linkText("glass.jpg"));
        clickElement(By.id("notifications"));
        clickElement(By.xpath("//div[contains(@class, 'taskItem')][*//div[contains(text(),'glass.jpg ')]]//button[*[contains(text(),'Approve')]]"));

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        setAttachmentDefault();
        logout();
        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        goToCdeByName(cdeName);

        checkAttachmentReviewed("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        removeAttachment("glass.jpg");
    }

}
