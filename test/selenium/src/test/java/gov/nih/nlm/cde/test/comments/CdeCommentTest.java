package gov.nih.nlm.cde.test.comments;


import gov.nih.nlm.common.test.CommentTest;
import org.testng.annotations.Test;

public class CdeCommentTest extends CommentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

}
