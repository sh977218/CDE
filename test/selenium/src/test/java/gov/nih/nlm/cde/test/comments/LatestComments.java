package gov.nih.nlm.cde.test.comments;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LatestComments extends CdeCommentTest {


    @Test
    public void latestComments() {
        mustBeLoggedInAs(reguser_username, password);

        String nindsComment = "FAD Total score value";
        String caBIGComment = "comment to Sarcoman";

        goToCdeByName(nindsComment);
        addComment("comment to FAD score");

        goToCdeByName("Sarcoma Dominant Histology Type");
        addComment(caBIGComment);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));

        textPresent(nindsComment);
        textPresent(caBIGComment);

        mustBeLoggedInAs(nlm_username, nlm_password);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));

        textNotPresent(nindsComment);
        textNotPresent(caBIGComment);

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Comments"));

        textPresent(nindsComment);
        textPresent(caBIGComment);

        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Comments"));
        textPresent(nindsComment);
        textNotPresent(caBIGComment);

        mustBeLoggedInAs(cabigAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Comments"));
        textNotPresent(nindsComment);
        textPresent(caBIGComment);
        
    }

}
