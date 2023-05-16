package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoincWidgetTest extends NlmCdeBaseTest {

    @Test
    public void lformsDisplay() {
        goToFormByName("Loinc Widget Test Form");
        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_lforms"));
        switchTab(1);
        textPresent("Prior BMSCT Administered Indicator");

        // test skip logic
        textNotPresent("BMSCT Section");
        textNotPresent("Imaging reference scan date");
        textNotPresent("Imaging dimension type");

        clickElement(By.id("/Section_1/VmtVCdXBxcs/1/1Yes"));
        textPresent("BMSCT Section");
        textPresent("Imaging reference scan date");
        textNotPresent("Imaging dimension type");

        clickElement(By.id("/Section_1/VmtVCdXBxcs/1/1No"));
        textNotPresent("BMSCT Section");
        textNotPresent("Imaging reference scan date");
        textPresent("Imaging dimension type");
        // End test Skip logic

        // Test UOM
        clickElement(By.id("unit_/Section_3/oYgcKSa7NSr/1/1"));
        textPresent("lbs");
        // End Test UOM

        // Test instructions
        clickElement(By.xpath("//label[contains(text(), 'Show Help')]"));

        // @TODO
        // re-enable after Loinc supports the new format for instructions
/*
        textPresent("Instructions for section 1");
        textPresent("Instructions for Priod BMSCT");
*/

        switchTabAndClose(0);
    }

}
