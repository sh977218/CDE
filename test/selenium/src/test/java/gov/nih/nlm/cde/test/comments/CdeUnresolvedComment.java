package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeUnresolvedComment extends NlmCdeBaseTest {

    @Test
    public void cdeUnresolvedCommentTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Cancer history indicator");

        startEditRegistrationStatus();
        textPresent("Update Registration Status");
        textNotPresent("There are unresolved comments");
        clickElement(By.id("cancelRegStatus"));

        goToDiscussArea();
        addComment("Simple comment");

        startEditRegistrationStatus();
        textPresent("Update Registration Status");
        clickElement(By.id("cancelRegStatus"));
        checkAlert("There are unresolved comments");
    }

}
