package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormViewingHistory extends NlmCdeBaseTest {

    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, password);

        goToFormByName("No Label Logic");
        hangon(4);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textPresent("User Profile");

        textPresent("No Label Logic");

    }

}
