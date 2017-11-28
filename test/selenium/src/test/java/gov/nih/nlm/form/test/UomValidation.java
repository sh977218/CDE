package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UomValidation extends NlmCdeBaseTest {

    @Test
    public void uomValidation() {
        goToFormByName("DNA Elements - Participant/Subject Information");
        goToFormDescription();
        textPresent("inch", By.cssSelector(".questionUom"));
        textPresent("meter", By.cssSelector(".questionUom"));
        textPresent("inches", By.cssSelector(".label-danger"));
        textPresent("cm", By.cssSelector(".questionUom"));

        textNotPresent("meter", By.cssSelector(".label-danger"));
        textNotPresent("m", By.cssSelector(".label-danger"));
    }

}
