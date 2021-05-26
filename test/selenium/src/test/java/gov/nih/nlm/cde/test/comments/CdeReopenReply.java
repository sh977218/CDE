package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeReopenReply extends NlmCdeBaseTest {

    @Test
    public void cdeReopenReplyTest() {
        String cdeName = "In the past 7 days, when I was in pain I moved slower";
        String reply = "This reply will be reopen";
        mustBeLoggedInAs(promis_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        isReplyStrike(reply, true);
        reopenReply(reply);
        goToCdeByName(cdeName);
        goToDiscussArea();
        isReplyStrike(reply, false);
    }

}
