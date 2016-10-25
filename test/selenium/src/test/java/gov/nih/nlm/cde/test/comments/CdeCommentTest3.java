package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class CdeCommentTest3 extends CdeCommentTest {
        
    @Test
    public void cdeComments() {
        comments("Hospital Confidential Institution Referred From Facility Number Code");
    }

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment("Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long", null);
    }

    @Test
    public void approveReply() {
        approveReply("Lower limb tone findings result");
    }

}
