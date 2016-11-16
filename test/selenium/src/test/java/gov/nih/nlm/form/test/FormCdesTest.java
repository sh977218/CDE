package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormCdesTest extends BaseFormTest {
    @Test
    public void formCdes() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Addenbrooke's Cognitive Examination Revised (ACE-R)");
        showAllTabs();
        clickElement(By.id("cdeList_tab"));
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - fluency sub score");
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - memory sub score");
        clickElement(By.linkText("Addenbrooke's Cognitive Examination - Revised (ACE-R) - memory sub score"));
        new Actions(driver).moveToElement(findElement(By.linkText("Addenbrooke's Cognitive Examination - Revised (ACE-R) - memory sub score")));
        textPresent("Sub-score for memory section as part of Addenbrooke's Cognitive Examination - Revised (ACE-R).");
        textPresent("ACERMemrySubScore");

        clickElement(By.id("addToCompare_1"));
        closeAlert();
        textPresent("Quick Board (1)");
        clickElement(By.id("pinToBoard_1"));
        textPresent("Choose a Board to pin");
        clickElement(By.id("cancelSelect"));
    }
}
