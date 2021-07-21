package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeReopenComment extends NlmCdeBaseTest {

    @Test
    public void cdeReopenCommentTest() {
        String cdeName = "Ethnic Group Category Text";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        reopenComment("This comment needs to reopen");
    }

}
