package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeResolveComment extends NlmCdeBaseTest {

    @Test
    public void cdeResolveCommentTest() {
        String cdeName = "Participant Identifier Source";
        mustBeLoggedInAs(test_username, password);
        goToCdeByName(cdeName);
        resolveComment("another comment about Naming");
    }

}
