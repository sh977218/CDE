package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SiteAdminNotSeeCommentsInProfile extends NlmCdeBaseTest {


    @Test
    public void siteAdminNotSeeCommentsInProfileTest() {
        String nindsComment = "comment to FAD score";
        String caBIGComment = "comment to Sarcoman";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToMyComments();
        textNotPresent(nindsComment);
        textNotPresent(caBIGComment);
    }

}
