package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class BmiTest extends NlmCdeBaseTest {

    @Test
    public void bmi() {
        String formName = "Body Mass Index";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);

        clickElement(By.name("0-0_uom_1"));
        findElement(By.name("0-0")).sendKeys("180");

        clickElement(By.name("0-1_uom_1"));
        findElement(By.name("0-1")).sendKeys("70" + Keys.TAB);

        textPresent("25.827", By.id("BMI_0-2"));
    }

}
