package gov.nih.nlm.system;

import org.testng.annotations.Test;
import org.testng.Assert;

public class ContactUs extends NlmCdeBaseTest {

    @Test
    public void contactUs() {
        goHome();
        goToContactUs();
        switchTab(1);
        String curUrl = driver.getCurrentUrl();
        Assert.assertTrue(curUrl.contains("https://support.nlm.nih.gov/?from=https://cde.nlm.nih.gov/"));
    }

}
