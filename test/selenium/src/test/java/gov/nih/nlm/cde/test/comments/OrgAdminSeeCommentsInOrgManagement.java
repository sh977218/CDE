package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OrgAdminSeeCommentsInOrgManagement extends NlmCdeBaseTest {

    String nindsComment = "comment to FAD score";
    String caBIGComment = "comment to Sarcoman";

    @Test
    public void orgAdminSeeCommentsInOrgManagementTest() {
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
}
