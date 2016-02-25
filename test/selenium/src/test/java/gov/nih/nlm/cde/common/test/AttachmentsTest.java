package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AttachmentsTest extends BaseAttachmentTest {

    @Test
    public void declineCdeAttachment() {
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Sedative sleep pill frequency";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("attachments_tab"));

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Alcohol use frequency");
        String attachmentName = "painLocationInapr.png";
        showAllTabs();
        addAttachment(attachmentName);
        checkAttachmentNotReviewed();
        declineAttachment(attachmentName);

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("attachments_tab"));
        textNotPresent("glass.jpg");
    }

    @Test
    public void checkOnlyShowingDefaultAttachmentCDE() {
        String cdeName = "Geriatric Depression Scale (GDS) - life satisfaction indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        showAllTabs();
        addAttachment("default.jpg");
        reviewAttachment("default.jpg");


        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        showAllTabs();
        setAttachmentDefault();

        goToCdeByName(cdeName);
        showAllTabs();
        addAttachment("nonDefault.jpg");

        openEltInList(cdeName, "cde");

        List<WebElement> l = driver.findElements(By.cssSelector("cdeAttachmentThumbnail"));
        for (WebElement we : l) {
            String src = we.getAttribute("src");
            Assert.assertTrue(src.contains("556ca45669b04bf418b7aeb8"));
            Assert.assertFalse(src.contains("556ca46a69b04bf418b7aef8"));
        }
    }

    @Test
    public void checkOnlyShowingDefaultAttachmentForm() {
        String formName = "Pre-Hospital/Emergency Medical Service (EMS) Course";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);

        showAllTabs();
        addAttachment("defaultAttachmentForForm.jpg");
        textPresent("This attachment cannot be dowloaded because it is pending approval.");
        reviewAttachment("defaultAttachmentForForm.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        showAllTabs();
        setAttachmentDefault();

        goToFormByName(formName);
        showAllTabs();
        addAttachment("nonDefault.jpg");

        openFormInList(formName);

        List<WebElement> l = driver.findElements(By.cssSelector("cdeAttachmentThumbnail"));
        for (WebElement we : l) {
            String src = we.getAttribute("src");
            Assert.assertTrue(src.contains("556ca45669b04bf418b7aeb8"));
            Assert.assertFalse(src.contains("556ca46a69b04bf418b7aef8"));
        }
    }


}
