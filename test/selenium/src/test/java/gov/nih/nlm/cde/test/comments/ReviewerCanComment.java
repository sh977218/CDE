package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ReviewerCanComment extends NlmCdeBaseTest {

    @Test
    public void reviewerCanCommentOnCdeTest() {
        String cdeName = "Pulmonary function lung function measurement";
        String commentText = "Comment made by reviewer";
        mustBeLoggedInAs(commentEditor_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();
        addComment(commentText);
        logout();
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);
    }

}
