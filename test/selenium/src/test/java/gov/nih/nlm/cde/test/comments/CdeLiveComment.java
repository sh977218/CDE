package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeLiveComment extends NlmCdeBaseTest {

    @Test
    public void cdeLiveCommentTest() {
        String cdeName = "Sensory system abnormality stocking glove present text";
        String existingComment = "new comment from nlm";
        String newComment = "This comment just added.";
        String reply = "can you see this";
        String replyToReply = "yes, i can";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        switchTab(1);
        goToCdeByName(cdeName);
        textPresent(existingComment);
        addComment(newComment);

        switchTab(0);
        textPresent(newComment);
        replyComment(0, reply);

        switchTab(1);
        textPresent(reply);
        replyComment(0, replyToReply);

        switchTab(0);
        textPresent(replyToReply);
    }
}
