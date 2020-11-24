package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WrongLogin extends NlmCdeBaseTest {

    @Test
    public void wrongLogin() {
        goToCdeSearch();
        login(bad_username, bad_password);
        checkAlert("Failed to log");
        driver.get(baseUrl + "/settings/profile");
        isLoggedOut();
        isLogin();

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
