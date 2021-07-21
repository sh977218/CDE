package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

import gov.nih.nlm.system.NlmCdeBaseTest;

public class NotLoggedInCannotSeeComment extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCannotSeeCommentTest() {
        String cdeName = "Imaging phase encode direction text";
        goToCdeByName(cdeName);
        textNotPresent("Discuss");
    }

}
