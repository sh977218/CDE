package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import org.testng.annotations.Test;

public class CdeCommentTest extends CommentTest {
    
    @Override
    public void goToEltByName(String name) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }
    
    
    @Test
    public void cdeComments() {
        comments("Hospital Confidential Institution Referred From");
    }

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment("Genbank");
    }

    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Genbank");
    }

}
