package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeRemoveComment extends NlmCdeBaseTest {

    @Test
    public void cdeRemoveCommentTest() {
        String cdeName = "Hospital Confidential Institution Referred From Facility Number Code";
        mustBeLoggedInAs(test_username, password);
        goToCdeByName(cdeName);
        removeComment("This comment needs to be removed.");
    }

}
