package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import org.testng.annotations.Test;

public class CdeCommentTest extends CommentTest {
    
    @Override
    public void goToEltByName(String name) {
        goToCdeByName(name);
    }
    
    @Test
    public void cdeComments() {
        comments();
    }

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment();
    }

    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment();
    }

}
