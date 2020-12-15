package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAdminCanRemoveFormCommentsTest extends NlmCdeBaseTest {

    @Test
    public void orgAdminCanRemoveFormComment() {
        String formName = "Form Comment Test";
        String commentText = "Inappropriate Comment";
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToFormByName(formName);
        removeComment(commentText);
    }

}
