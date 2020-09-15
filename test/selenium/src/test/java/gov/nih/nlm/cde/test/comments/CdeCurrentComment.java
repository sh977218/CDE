package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeCurrentComment extends NlmCdeBaseTest {

//    @Test()
    public void cdeCurrentCommentTest() {
        String cdeName = "Hospital Confidential Institution Referred From Facility Number Code";
        goToCdeByName(cdeName);
        goToDiscussArea();
        checkCurrentCommentByIndex(0, true);
        checkCurrentCommentByIndex(1, false);
        goToNaming();
        checkCurrentCommentByIndex(1, true);
        checkCurrentCommentByIndex(0, false);
    }
}
