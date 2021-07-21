package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeResolveReply extends NlmCdeBaseTest {

    @Test
    public void cdeResolveReplyTest() {
        String cdeName = "In the past 7 days, when I was in pain I protected the part of my body that hurt";
        String reply = "This reply will be resolved";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        isReplyStrike(reply, false);
        resolveReply(reply);
        goToCdeByName(cdeName);
        goToDiscussArea();
        isReplyStrike(reply, true);
    }

}
