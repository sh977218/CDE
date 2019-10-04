package gov.nih.nlm.cde.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IncreaseLockoutLogin extends NlmCdeBaseTest {

    @Test
    public void increaseLockoutLogin() {
        goToCdeSearch();
        clickElement(By.linkText("LOGIN"));
        findElement(By.id("uname")).sendKeys(lockout_increase_username);
        findElement(By.id("passwd")).sendKeys(password + "111");
        clickElement(By.id("login_button"));
        clickElement(By.id("login_button"));
        clickElement(By.id("login_button"));
        checkAlert("Failed to log in. Incorrect username or password");
        driver.get(baseUrl + "/settings/profile");
        findElement(By.id("login_link"));
        textPresent("Please Log In");

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
