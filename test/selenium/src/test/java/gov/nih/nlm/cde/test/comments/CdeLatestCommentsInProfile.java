package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLatestCommentsInProfile extends NlmCdeBaseTest {

    @Test
    public void cdeLatestCommentsInProfileTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToMyComments();
        textPresent("This is a comment.");
        textPresent("This comment is to test current comment css.");
    }

}
