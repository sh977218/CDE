package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class OrgAdminSeeCommentsInOrgManagement extends NlmCdeBaseTest {

    String nindsComment = "comment to FAD score";
    String caBIGComment = "comment to Sarcoman";

    @Test
    public void orgAdminSeeCommentsInOrgManagementTest() {
        mustBeLoggedInAs(ninds_username, password);
        goToMyOrgComments();
        textPresent(nindsComment);
        textNotPresent(caBIGComment);
    }

    @Test
    public void orgAdminCanSeeCommentsInOrgManagementTest2() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToMyOrgComments();
        textNotPresent(nindsComment);
        textPresent(caBIGComment);
    }
}
