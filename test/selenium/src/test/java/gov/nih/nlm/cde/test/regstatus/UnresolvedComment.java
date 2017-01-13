package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.cde.test.comments.CdeCommentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UnresolvedComment extends CdeCommentTest {

    @Test
    public void unresolvedComment() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Cancer history indicator");


        clickElement(By.id("editStatus"));
        textPresent("Update Registration Status");
        textNotPresent("There are unresolved comments");
        clickElement(By.id("cancelRegStatus"));

        addComment("Simple comment");

        clickElement(By.id("editStatus"));
        textPresent("Update Registration Status");
        textPresent("There are unresolved comments");
        closeAlert();
        clickElement(By.id("cancelRegStatus"));

    }


}
