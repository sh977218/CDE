package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeDeclineComment extends NlmCdeBaseTest {
    @Test()
    public void cdeDeclineCommentTest() {
        String cdeName = "Alcohol use started age value";
        String sensorComment = "This comment is pending approval";
        goToCdeByName(cdeName);
        goToDiscussArea();
        textPresent(sensorComment);
        declineComment(commentEditor_username, commentEditor_password, anonymousCommentUser2_username, "Bad Comment");

        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        textNotPresent(sensorComment);
    }
}
