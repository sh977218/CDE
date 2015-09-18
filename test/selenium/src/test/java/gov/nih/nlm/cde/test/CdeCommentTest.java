package gov.nih.nlm.cde.test;


import gov.nih.nlm.common.test.CommentTest;

public class CdeCommentTest extends CommentTest {
    
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
}
