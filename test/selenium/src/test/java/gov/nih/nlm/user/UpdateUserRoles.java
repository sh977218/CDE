package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateUserRoles extends NlmCdeBaseTest {
    @Test
    void updateUserRoles() {
        mustBeLoggedInAs(nlm_username,nlm_password);
        goToUsers();
        searchUsername(empty_roles_username);
        clickElement(By.id("searchUsersSubmit"));
        clickElement(By.id("user_roles_0"));
        selectMatDropdownByText("AttachmentReviewer");
    }
}
