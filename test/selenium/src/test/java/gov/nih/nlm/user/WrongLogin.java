package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WrongLogin extends NlmCdeBaseTest {

    @Test
    public void wrongLogin() {
        goToCdeSearch();

        openLogin();
        clickElement(By.linkText("sign in now"));
        int sourceTabIndex = switchTabToLast();
        textPresent("Username:");
        findElement(By.name("username")).sendKeys(bad_username);
        findElement(By.name("password")).sendKeys(bad_password);
        clickElement(By.cssSelector("input[type='submit']"));
        textPresent("Login Failed");
        switchTab(sourceTabIndex);

        driver.get(baseUrl + "/settings/profile");
        isLoggedOut();
        isLoginPage();

        mustBeLoggedInAs(ctepCurator_username, password);
    }

}
