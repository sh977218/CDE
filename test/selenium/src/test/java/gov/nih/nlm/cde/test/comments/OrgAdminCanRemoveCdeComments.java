package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class OrgAdminCanRemoveCdeComments extends CdeCommentTest {

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment("Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long", null);
    }

}
