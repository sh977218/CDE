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
        findElement(By.id("li-blank-Qualified")).click();
        textNotPresent("Vision Deficit Report");
        textPresent("| Qualified");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent("Vision Deficit Report");
        findElement(By.id("li-checked-Recorded")).click();
        hangon(1);
        findElement(By.id("li-blank-Candidate")).click();
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        textNotPresent("Vision Deficit Report");
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Diabetes - Adverse Event");
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textNotPresent("Vision Deficit Report");
    }

}
