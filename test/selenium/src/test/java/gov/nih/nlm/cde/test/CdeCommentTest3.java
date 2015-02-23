package gov.nih.nlm.cde.test;

import org.testng.annotations.Test;

public class CdeCommentTest3 extends CdeCommentTest {
        
    @Test
    public void cdeComments() {
        comments("Hospital Confidential Institution Referred From");
    }

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment("Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long", null);
    }

}
