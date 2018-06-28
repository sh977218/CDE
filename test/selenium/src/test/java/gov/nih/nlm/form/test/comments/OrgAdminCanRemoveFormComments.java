package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAdminCanRemoveFormComments extends NlmCdeBaseTest {

    @Test
    public void orgAdminCanRemoveFormCommentTest() {
        String formName = "Form Comment Test";
        String commentText = "Inappropriate Comment";
        mustBeLoggedInAs(test_username, password);
        goToFormByName(formName);
        removeComment(commentText);
    }

}
