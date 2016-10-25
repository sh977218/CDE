package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class ReviewerCanComment extends CdeCommentTest {

    @Test
    public void reviewerCanComment() {
        reviewerCanComment("Pulmonary function lung function measurement");
    }

}
