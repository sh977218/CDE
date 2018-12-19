package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SiteAdminSeeCommentsInSiteManagement extends NlmCdeBaseTest {

    @Test
    public void siteAdminSeeCommentsInSiteManagementTest() {
        String nindsComment = "comment to FAD score";
        String caBIGComment = "comment to Sarcoman";
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.xpath("/div[. = 'Comments']"));
        textPresent(nindsComment);
        textPresent(caBIGComment);
    }

}
