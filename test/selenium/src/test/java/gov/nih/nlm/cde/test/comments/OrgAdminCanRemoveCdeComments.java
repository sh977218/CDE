package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class OrgAdminCanRemoveCdeComments extends CdeCommentTest {

    @Test
    public void orgAdminCanRemoveCdeComment() {
        String cdeName = "Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long";
        String commentText = "Inappropriate Comment";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        removeComment(commentText);
    }

}
