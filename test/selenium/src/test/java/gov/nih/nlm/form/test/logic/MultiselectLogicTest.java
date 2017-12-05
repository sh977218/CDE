package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MultiselectLogicTest extends NlmCdeBaseTest {

    @Test
    public void multiselectLogic() {
        goToFormByName("MultiSelect Logic");
        clickElement(By.id("selectRenderButton"));
        clickElement(By.xpath("(//*[@id='selectRenderButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));
        textNotPresent("Own home with self care");
        textNotPresent("Slight ataxia (slowness or unsteady turning)");
        clickElement(By.xpath("//label[normalize-space(.)='Medicare']//input"));
        textPresent("Own home with self care");
        textNotPresent("Slight ataxia (slowness or unsteady turning)");
        clickElement(By.xpath("//label[normalize-space(.)='Veterans Affairs/Military']//input"));
        textPresent("Own home with self care");
        textPresent("Slight ataxia (slowness or unsteady turning)");
    }


}
