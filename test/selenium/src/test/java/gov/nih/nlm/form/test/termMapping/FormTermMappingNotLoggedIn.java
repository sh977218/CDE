package gov.nih.nlm.form.test.termMapping;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormTermMappingNotLoggedIn extends NlmCdeBaseTest {

    @Test
    public void checkNotLoggedIn() {
        goToFormByName("Socioeconomic Status");

        textPresent("D003710 - Demography");
        textPresent("D000328 - Adult");

        Assert.assertEquals(driver.findElements(By.id("addTermMap")).size(), 0);

        Assert.assertEquals(driver.findElements(By.xpath("//i[@title='Remove Mesh Term']")).size(), 0);
    }

}
