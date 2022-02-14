package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoLabelsNoVersionTest extends NlmCdeBaseTest {

    @Test
    public void twoLabelsNoVersion() {
        String formName = "NoVersionCdeFormTest";
        mustBeLoggedInAs(testEditor_username, password);
        goToFormByName(formName);
        goToFormDescription();
        startEditQuestionById("question_0-0");
        selectQuestionLabelByIndex("question_0-0", 1, (Integer i) -> {
            textPresent("No Label");
        });
        modalGone();
        textPresent("Second name for label", By.xpath("//*[@id='question_0-0']//span[contains(@class,'questionLabel')]"));
    }

}
