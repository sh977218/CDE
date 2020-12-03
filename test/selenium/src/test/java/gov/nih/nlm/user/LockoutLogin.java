package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LockoutLogin extends NlmCdeBaseTest {

    @Test
    public void lockoutLogin() {
        goToCdeSearch();
        login(lockout_username, password);
        checkAlert("Failed to log in. User is locked out");
        driver.get(baseUrl + "/settings/profile");
        isLoggedOut();
        isLogin();

        mustBeLoggedInAs(ctepCurator_username, password);
    }


}
