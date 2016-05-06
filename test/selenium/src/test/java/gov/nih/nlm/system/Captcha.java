package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class Captcha extends NlmCdeBaseTest {

    @Test
    public void loginFailureCaptcha() {
        mustBeLoggedOut();
        clickElement(By.linkText("Log In"));

        for (int i = 0; i < 3; i++) {
            enterUsernamePasswordSubmit("bad-username", "bad-password", "Failed to log in.");
        }
        enterUsernamePasswordSubmit("bad-username", "bad-password", "Please fill out the Captcha before login in.");
    }
}
