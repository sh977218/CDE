package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class SiteAdminCanSeeComment extends NlmCdeBaseTest {

    @Test
    public void siteAdminCanSeeCommentTest() {
        String cdeName = "Imaging phase encode direction text";
        mustBeLoggedInAs(nlm_username,nlm_password);
        goToCdeByName(cdeName);
        textPresent("Discuss");
    }

}
