package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAdminCanRemoveCdeComments extends NlmCdeBaseTest {

    @Test
    public void orgAdminCanRemoveCdeCommentTest() {
        String cdeName = "Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long";
        String commentText = "Inappropriate Comment";
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName(cdeName);
        removeComment(commentText);
    }

}
