package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;

public class FormViewingHistory extends NlmCdeBaseTest {

    @Test
    public void formViewingHistory() {
        String formName = "Skip Logic No Label Form";
        mustBeLoggedInAs(history_username, password);

        goToFormByName(formName);
        hangon(4);

        try {
            goToUserMenu();
            clickElement(By.linkText("Profile"));
            textPresent("User Profile");
            textPresent("Skip Logic No Label Form");
        } catch (TimeoutException e) {
            driver.navigate().refresh();
            textPresent("Skip Logic No Label Form");
        }

    }

}
