package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormNamingReorder extends NlmCdeBaseTest {

    @Test
    public void formReorderNamingTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("form for test cde reorder detail tabs");
        clickElement(By.id("naming_tab"));
        textPresent("Definition:");
        clickElement(By.xpath("//div[@id='moveDown-0']"));
        textPresent("form for test cde reorder detail tabs", By.xpath("//div[@id='designation_1']"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        textPresent("form for test cde reorder detail tabs 3", By.xpath("//div[@id='designation_1']"));
        clickElement(By.xpath("//div[@id='moveTop-2']"));
        textPresent("form for test cde reorder detail tabs", By.xpath("//div[@id='designation_0']"));
    }
}
