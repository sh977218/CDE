
package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.anonymousCommentUser_username;
import org.testng.annotations.Test;

public class CdeCommentTest2 extends CdeCommentTest {
    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Genbank", null);
    }
    
    @Test
    public void approvingCommentsCde() {
        approvingComments("Imaging phase encode direction text", null, anonymousCommentUser_username);
    }    

}
