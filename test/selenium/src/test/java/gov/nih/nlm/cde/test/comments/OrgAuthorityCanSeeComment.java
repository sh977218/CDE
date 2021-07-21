package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAuthorityCanSeeComment extends NlmCdeBaseTest {

    @Test
    public void orgAuthorityCanSeeCommentTest() {
        String cdeName = "Imaging phase encode direction text";
        mustBeLoggedInAs(orgAuthorityUser_username, password);
        goToCdeByName(cdeName);
        textPresent("Discuss");
    }

}
