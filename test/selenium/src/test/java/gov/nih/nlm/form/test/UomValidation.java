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
        textPresent("inches (invalid)", By.cssSelector(".questionUom"));
        textPresent("cm", By.cssSelector(".questionUom"));

        textNotPresent("inch (invalid)", By.cssSelector(".questionUom"));
        textNotPresent("meter (invalid)", By.cssSelector(".questionUom"));
        textNotPresent("cm (invalid)", By.cssSelector(".questionUom"));
        textNotPresent("m (invalid)", By.cssSelector(".questionUom"));
    }

}
