package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CheckOnlyShowingDefaultAttachmentCDE extends BaseAttachmentTest {

    @Test
    public void checkOnlyShowingDefaultAttachmentCDE() {
        String cdeName = "Geriatric Depression Scale (GDS) - life satisfaction indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToAttachments();
        addAttachment("default.jpg");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        setAttachmentDefault();
        goToCdeByName(cdeName);
        goToAttachments();

        addAttachment("nonDefault.jpg");
        openEltInList(cdeName, "cde");

        List<WebElement> l = driver.findElements(By.cssSelector("cdeAttachmentThumbnail"));
        for (WebElement we : l) {
            String src = we.getAttribute("src");
            Assert.assertTrue(src.contains("556ca45669b04bf418b7aeb8"));
            Assert.assertFalse(src.contains("556ca46a69b04bf418b7aef8"));
        }
    }

}
