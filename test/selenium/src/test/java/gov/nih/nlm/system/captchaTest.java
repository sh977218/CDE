package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class captchaTest extends NlmCdeBaseTest {

    @Test
    public void repeatFailure() {
        mustBeLoggedOut();
		try {
            findElement(By.linkText("Log In")).click();
        } catch (TimeoutException e) {
            logout();
            findElement(By.linkText("Log In")).click();
        }
		int i = 0;
		while (i <3){
        enterUsernamePasswordSubmit("bad-username", "bad-password", "Failed to log in.");
		i++;
		}
        enterUsernamePasswordSubmit("bad-username", "bad-password", "Please fill out the Captcha before login in.");
    }
}
