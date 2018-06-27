package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LatestComments extends NlmCdeBaseTest {

    String nindsComment = "comment to FAD score";
    String caBIGComment = "comment to Sarcoman";

    @Test
    public void siteAdminCannotSeeCommentsInProfileTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textNotPresent(nindsComment);
        textNotPresent(caBIGComment);
    }

    @Test
    public void siteAdminCanSeeCommentsInSiteManagementTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Comments"));
        textPresent(nindsComment);
        textPresent(caBIGComment);
    }


    @Test
    public void orgAdminCanSeeCommentsInOrgManagementTest1() {
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Comments"));
        textPresent(nindsComment);
        textNotPresent(caBIGComment);
    }

    @Test
    public void orgAdminCanSeeCommentsInOrgManagementTest2() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Comments"));
        textNotPresent(nindsComment);
        textPresent(caBIGComment);
    }

    @Test
    public void latestComments() {
        mustBeLoggedInAs(commentEditor_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textPresent(nindsComment);
        textPresent(caBIGComment);
    }

}
