package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormFacetsTest extends BaseFormTest {

    @Test
    public void formFacets() {
        gotoPublicForms();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");
        textPresent("| All Statuses");
        findElement(By.id("li-checked-Recorded")).click();
        textNotPresent("Vision Deficit Report");
        findElement(By.id("li-blank-Recorded")).click();
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        textPresent("Vision Deficit Report");
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");
    }

}
