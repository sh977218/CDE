package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoincWidgetTest extends NlmCdeBaseTest {

    @Test
    public void lformsDisplay() {
        goToFormByName("Loinc Widget Test Form");
        textPresent("Prior BMSCT Administered Indicator");

        // test skip logic
        textNotPresent("BMSCT Section");
        textNotPresent("Imaging reference scan date");
        textNotPresent("Imaging dimension type");

        findElement(By.id("/Section_1/VmtVCdXBxcs/1/1")).sendKeys("Yes");
        findElement(By.xpath("//label[@for='/Section_1/1']")).click();
        textPresent("BMSCT Section");
        textPresent("Imaging reference scan date");
        textNotPresent("Imaging dimension type");

        findElement(By.id("/Section_1/VmtVCdXBxcs/1/1")).clear();
        findElement(By.id("/Section_1/VmtVCdXBxcs/1/1")).sendKeys("No");
        findElement(By.xpath("//label[@for='/Section_1/1']")).click();
        textNotPresent("BMSCT Section");
        textNotPresent("Imaging reference scan date");
        textPresent("Imaging dimension type");
        // End test Skip logic

        // Test UOM
        findElement(By.id("ac1"));
        // End Test UOM

        // Test instructions
        findElement(By.xpath("//label[contains(text(), 'Show Help')]")).click();
        textPresent("Instructions for section 1");
        textPresent("Instructions for Priod BMSCT");

    }

}
