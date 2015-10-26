package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormCdesTest extends BaseFormTest {
    @Test
    public void formCdes() {
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Addenbrooke's Cognitive Examination Revised (ACE-R)");
        findElement(By.cssSelector("[heading=\"CDE List\"]")).click();
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - fluency sub score");
        textPresent("Addenbrooke's Cognitive Examination - Revised (ACE-R) - memory sub score");
        findElement(By.partialLinkText("- memory sub score")).click();
        textPresent("Sub-score for memory section as part of Addenbrooke's Cognitive Examination - Revised (ACE-R).");
        textPresent("ACERMemrySubScore");
        findElement(By.id("addToCompare_1")).click();
        textPresent("Quick Board ( 1 )");
        findElement(By.id("pinToBoard_1")).click();
        textPresent("Select Board");
        findElement(By.id("cancelSelect")).click();
    }
}
