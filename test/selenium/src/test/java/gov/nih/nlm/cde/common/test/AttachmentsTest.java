package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;
import org.testng.Assert;
import java.util.List;

public class AttachmentsTest extends BaseAttachmentTest {

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

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Sedative sleep pill frequency";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");

        addAttachment("painLocationInapr.png");
        checkAttachmentNotReviewed();
        declineAttachment();

        goToCdeByName(cdeName);
        findElement(By.linkText("Attachments")).click();
        textNotPresent("glass.jpg");
    }

    @Test
    public void checkOnlyShowingDefaultAttachment() {
        String cdeName = "Geriatric Depression Scale (GDS) - life satisfaction indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        addAttachment("default.jpg");
        reviewAttachment("default.jpg");


        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        setAttachmentDefault();

        goToCdeByName(cdeName);
        addAttachment("nonDefault.jpg");

        openEltInList(cdeName, null, null);

        List<WebElement> l = driver.findElements(By.cssSelector("cdeAttachmentThumbnail"));
        for (WebElement we : l){
            String src = we.getAttribute("src");
            Assert.assertTrue(src.contains("556ca45669b04bf418b7aeb8"));
            Assert.assertFalse(src.contains("556ca46a69b04bf418b7aef8"));
        }
    }
}
