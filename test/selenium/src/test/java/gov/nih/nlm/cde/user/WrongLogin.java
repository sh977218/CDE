package gov.nih.nlm.cde.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WrongLogin extends NlmCdeBaseTest {

    @Test
    public void wrongLogin() {
        goToCdeSearch();
        clickElement(By.linkText("LOGIN"));


        findElement(By.id("uname")).sendKeys("bad-username");
        findElement(By.id("passwd")).sendKeys("bad-password");
        clickElement(By.id("login_button"));

        checkAlert("Failed to log");

        driver.get(baseUrl + "/settings/profile");
        findElement(By.id("login_link"));
        textPresent("Please Log In");

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
