package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IncreaseLockoutLogin extends NlmCdeBaseTest {

    @Test
    public void increaseLockoutLogin() {
        goToCdeSearch();
        clickElement(By.id("login_link"));
        findElement(By.id("uname")).sendKeys(lockout_increase_username);
        findElement(By.id("passwd")).sendKeys(password + "111");
        clickElement(By.id("login_button"));
        clickElement(By.id("login_button"));
        clickElement(By.id("login_button"));
        checkAlert("Failed to log in. Incorrect username or password");
        driver.get(baseUrl + "/settings/profile");
        findElement(By.id("login_link"));
        textPresent("This warning banner provides privacy and security notices consistent");

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
