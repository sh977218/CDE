package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormNamingReorder extends NlmCdeBaseTest {

    @Test
    public void formReorderNamingTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("form for test cde reorder detail tabs");
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Naming")).click();
        textPresent("Definition:");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        textPresent("form for test cde reorder detail tabs", By.xpath(prefix + "dd_name_1" + postfix));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        textPresent("form for test cde reorder detail tabs 3", By.xpath(prefix + "dd_name_1" + postfix));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        textPresent("form for test cde reorder detail tabs", By.xpath(prefix + "dd_name_0" + postfix));
    }
}
