package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfiniteScrollDescription extends NlmCdeBaseTest {

    @Test
    public void infiniteScrollDescription() {
        mustBeLoggedInAs("ninds", password);
        goToFormByName("Food Frequency Questionnaire (FFQ)");
        goToGeneralDetail();
        textPresent("The Food Frequency Questionnaire (FFQ) consists of a list of foods with little descriptive detail, and the respondent answers questions about the frequency of each food on the list.");
        goToPreview();
        goToFormDescription();
        textPresent("Do you currently take multi-vitamins?(Please report other individual vitamins in question 2)");
        textPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");
    }
}
