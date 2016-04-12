package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class InfiniteScrollDescription extends NlmCdeBaseTest {

    @Test
    public void infiniteScrollDescription() {
        goToFormByName("Food Frequency Questionnaire (FFQ)");
        clickElement(By.id("description_tab"));
        textNotPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");
        String jsScroll = "scrollBy(0, 200);";

        for (int i = 0; i < 10; i++) {
            ((JavascriptExecutor) driver).executeScript(jsScroll, "");
        }
        textNotPresent("Not counting multi-vitamins, do you currently take Calcium or Dolomite (including Tums)?");
    }

}
