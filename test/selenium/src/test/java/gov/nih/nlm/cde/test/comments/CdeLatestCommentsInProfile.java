package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLatestCommentsInProfile extends NlmCdeBaseTest {

    @Test
    public void cdeLatestCommentsInProfileTest() {
        String nindsComment = "comment to FAD score";
        String caBIGComment = "comment to Sarcoman";
        mustBeLoggedInAs(commentEditor_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textPresent(nindsComment);
        textPresent(caBIGComment);
    }

}