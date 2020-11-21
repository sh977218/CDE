package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WrongLogin extends NlmCdeBaseTest {

    @Test
    public void wrongLogin() {
        goToCdeSearch();
        clickElement(By.id("login_link"));
        findElement(By.id("uname")).sendKeys(bad_username);
        findElement(By.id("passwd")).sendKeys(bad_password);
        clickElement(By.id("login_button"));
        checkAlert("Failed to log");
        driver.get(baseUrl + "/settings/profile");
        findElement(By.id("login_link"));
        textPresent("This warning banner provides privacy and security notices consistent");

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
