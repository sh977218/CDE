package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LockoutLogin extends NlmCdeBaseTest {

    @Test
    public void lockoutLogin() {
        goToCdeSearch();
        clickElement(By.linkText("LOGIN"));
        findElement(By.id("uname")).sendKeys(lockout_username);
        findElement(By.id("passwd")).sendKeys(password);
        clickElement(By.id("login_button"));
        checkAlert("Failed to log in. User is locked out");
        driver.get(baseUrl + "/settings/profile");
        findElement(By.id("login_link"));
        textPresent("Please Log In");

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}