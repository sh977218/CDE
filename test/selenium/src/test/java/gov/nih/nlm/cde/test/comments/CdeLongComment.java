package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;

public class CdeLongComment extends NlmCdeBaseTest {

    @Test
    public void cdeLongCommentTest() {
        String cdeName = "Number of Pregnancies";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        clickElement(By.id("showAllRepliesButton_0"));
        textNotPresent("Show all 10 replies");
        for (int k = 1; k <= 10; k++) {
            textPresent("Reply to very long comment " + k);
        }
    }
}
