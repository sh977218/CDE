package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CheckOnlyShowingDefaultAttachmentForm extends BaseAttachmentTest {

    @Test
    public void checkOnlyShowingDefaultAttachmentForm() {
        String formName = "Pre-Hospital/Emergency Medical Service (EMS) Course";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);

        showAllTabs();
        addAttachment("defaultAttachmentForForm.jpg");
        try {
            textPresent("This attachment cannot be dowloaded because it is pending approval.");
        } catch (TimeoutException e) {
            // redo because sometimes mock does not work
            goToFormByName(formName);

            showAllTabs();
            addAttachment("defaultAttachmentForForm.jpg");
            textPresent("This attachment cannot be dowloaded because it is pending approval.");
        }
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