package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class SiteAdminSeeCommentsInSiteManagement extends NlmCdeBaseTest {

    @Test
    public void siteAdminSeeCommentsInSiteManagementTest() {
        String nindsComment = "comment to FAD score";
        String caBIGComment = "comment to Sarcoman";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToAllComments();
        textPresent(nindsComment);
        textPresent(caBIGComment);
        selectMatSelectByLabel("", "Filter by Organization", "NINDS");
        textPresent(nindsComment);
        textNotPresent(caBIGComment);
        selectMatSelectByLabel("", "Filter by Organization", "caBIG");
        textNotPresent(nindsComment);
        textPresent(caBIGComment);
    }

}
