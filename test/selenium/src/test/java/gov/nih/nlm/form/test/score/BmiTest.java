package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class BmiTest extends NlmCdeBaseTest {

    @Test
    public void bmi() {
        String formName = "Body Mass Index Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("preview_tab"));
        findElement(By.name("0-0")).sendKeys("80");
        findElement(By.name("0-1")).sendKeys("1.8");
        findElement(By.name("0-1")).sendKeys(Keys.TAB);
        textPresent("");
    }

}
