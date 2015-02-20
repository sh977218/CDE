package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import org.testng.annotations.Test;

public class CdeCommentTest extends CommentTest {
    
    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name, status);
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
        orgAdminCanRemoveComment("Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long", null);
    }

    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Genbank", null);
    }
    
    @Test
    public void approvingCommentsCde() {
        approvingComments("Imaging phase encode direction text", null);
    }    

}
