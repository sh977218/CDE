package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfiniteScrollDescription extends NlmCdeBaseTest {

    @Test
    public void infiniteScrollDescription() {
        mustBeLoggedInAs("ninds", password);
        goToFormByName("Food Frequency Questionnaire (FFQ)");
        textPresent("The Food Frequency Questionnaire (FFQ) consists of a list of foods with little descriptive detail, and the respondent answers questions about the frequency of each food on the list.");
        clickElement(By.id("description_tab"));
        textPresent("Do you currently take multi-vitamins?(Please report other individual vitamins in question 2)");
        textNotPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");

        try {
            scrollToViewById("scrollMore");
            textPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");
        } catch (Exception e) {
            for (int i = 0; i < 10; i++) {
                scrollToViewById("scrollMore");
            }
            textPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");
        }
    }
}
