package gov.nih.nlm.form.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class MeanValue extends NlmCdeBaseTest {

    @Test
    public void meanValue() {
        String formName = "Mean Value Test";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToPreview();
        findElement(By.name("0-0")).sendKeys("8");
        findElement(By.name("0-1")).sendKeys("11");
        findElement(By.name("0-1")).sendKeys(Keys.TAB);
        textPresent("9.5");
    }

}
