package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoLabelsNoVersion extends NlmCdeBaseTest {

    @Test
    @RecordVideo
    public void twoLabelsNoVersion() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("NoVersionCdeFormTest");
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("question_accordion_0_0")).click();
        findElement(By.cssSelector("#dd_question_title_0 i")).click();
        hangon(1);
        findElement(By.cssSelector("#q_select_name_1 button")).click();
        modalGone();
        textPresent("Second name for label", By.id("dd_question_title_0"));
        clickElement(By.id("discardChanges"));
    }

}
