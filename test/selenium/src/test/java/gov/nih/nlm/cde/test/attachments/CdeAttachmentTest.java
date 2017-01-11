package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAttachmentTest extends BaseAttachmentTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Alcohol use frequency";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);

        clickElement(By.id("attachments_tab"));
        textNotPresent("Upload more files");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        addAttachment("glass.jpg");
        checkAttachmentNotReviewed();
        reviewAttachment("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        setAttachmentDefault();
        mustBeLoggedOut();
//        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));

        goToCdeByName(cdeName);

        checkAttachmentReviewed("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        removeAttachment("glass.jpg");
    }

}
