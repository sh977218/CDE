package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAdminCanSeeComment extends NlmCdeBaseTest {

    @Test
    public void orgAdminCanSeeCommentTest() {
        String cdeName = "Imaging phase encode direction text";
        mustBeLoggedInAs(orgAdminUser_username, password);
        goToCdeByName(cdeName);
        textPresent("Discuss");
    }

}
