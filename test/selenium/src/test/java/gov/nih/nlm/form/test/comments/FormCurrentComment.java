package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormCurrentComment extends NlmCdeBaseTest {

//    @Test()
    public void formCurrentCommentTest() {
        String formName = "Activities of Daily Living and Gait";
        goToFormByName(formName);
        goToDiscussArea();
        checkCurrentCommentByIndex(0, false);
        goToNaming();
        checkCurrentCommentByIndex(0, true);
    }
}
