package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeAttachmentTest extends BaseAttachmentTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Alcohol use frequency";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("Upload more files");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        addAttachment();
        checkAttachmentNotReviewed();
        reviewAttachment("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        setAttachmentDefault();
        mustBeLoggedOut();
        hangon(5);

        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        findElement(By.xpath("//a[@id='openEltInCurrentTab_0']")).click();

        goToCdeByName(cdeName);
        checkAttachmentReviewed("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        removeAttachment();
    }

}
