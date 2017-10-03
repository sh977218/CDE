package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoLabelsNoVersionTest extends NlmCdeBaseTest {

    @Test
    public void twoLabelsNoVersion() {
        String formName = "NoVersionCdeFormTest";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        startEditQuestionSectionById("question_0_0");
        clickElement(By.xpath("//*[@id='question_0_0']//i[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("No Label");
        clickElement(By.cssSelector("#q_select_name_1 button"));
        modalGone();
        textPresent("Second name for label", By.xpath("//*[@id='question_0_0']//div[contains(@class,'questionLabel')]"));
    }

}
