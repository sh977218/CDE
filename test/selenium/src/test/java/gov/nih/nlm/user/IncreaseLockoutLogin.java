package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IncreaseLockoutLogin extends NlmCdeBaseTest {

    @Test
    public void increaseLockoutLogin() {
        goToCdeSearch();

        openLogin();
        clickElement(By.id("logInButton"));
        int sourceTabIndex = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(lockout_increase_username);
        findElement(By.name("password")).sendKeys(password + "111");
        clickElement(By.cssSelector("input[type='submit']"));
        textPresent("Login Failed");
        switchTab(sourceTabIndex);

        driver.get(baseUrl + "/settings/profile");
        isLoggedOut();
        isLoginPage();

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
