package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
/**
 * Created by flaskaj on 9/24/2015.
 */
public class FormCdesTest extends BaseFormTest {
    @Test
    public void formCdes() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Addenbrooke's Cognitive Examination Revised (ACE-R)");
        findElement(By.cssSelector("[heading=\"CDE List\"]")).click();
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - fluency sub score");
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - memory sub score");
        findElement(By.id("acc_link_1")).click();
        textPresent("Sub-score for memory section as part of Addenbrooke's Cognitive Examination - Revised (ACE-R).");
        textPresent("ACERMemrySubScore");
        findElement(By.id("addToCompare_1")).click();
        textPresent("Quick Board ( 1 )");
        findElement(By.id("pinToBoard_1")).click();
        textPresent("Select Board");
    }
}
