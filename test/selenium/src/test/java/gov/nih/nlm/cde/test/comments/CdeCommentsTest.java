package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class CdeCommentsTest extends CdeCommentTest {

    @Test
    public void cdeComments() {
        comments("Hospital Confidential Institution Referred From Facility Number Code");
    }


    @Test
    public void cdeLongComments() {
        showLongComments("Number of Pregnancies");
    }

}
