
package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class SiteAdminCanRemoveFormComment extends NlmCdeBaseTest {

    @Test
    public void siteAdminCanRemoveFormCommentTest() {
        String formName = "AED Resistance Log";
        String commentText = "Another Inappropriate Comment";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(formName);
        removeComment(commentText);
    }

}
