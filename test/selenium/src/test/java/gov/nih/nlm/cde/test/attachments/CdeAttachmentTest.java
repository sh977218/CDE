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
        showAllTabs();
        clickElement(By.id("attachments_tab"));
        textNotPresent("Upload more files");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        showAllTabs();
        addAttachment("glass.jpg");
        checkAttachmentNotReviewed();
        reviewAttachment("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        showAllTabs();
        setAttachmentDefault();
        mustBeLoggedOut();
//        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));

        goToCdeByName(cdeName);
        showAllTabs();
        checkAttachmentReviewed("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        showAllTabs();
        removeAttachment("glass.jpg");
    }

}
