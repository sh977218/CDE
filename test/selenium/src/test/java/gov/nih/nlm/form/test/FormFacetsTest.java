package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormFacetsTest extends BaseFormTest {

    @Test
    public void formFacets() {
        setLowStatusesVisible();
        goToFormSearch();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        clickElement(By.id("li-blank-Qualified"));
        textNotPresent("Vision Deficit Report");
        textPresent("Qualified", By.id("status_crumb"));
        clickElement(By.id("li-blank-Recorded"));
        textPresent("Vision Deficit Report");
        clickElement(By.id("li-checked-Recorded"));
        hangon(1);
        clickElement(By.id("li-blank-Candidate"));
        hangon(1);
        clickElement(By.id("li-checked-Qualified"));
        textNotPresent("Vision Deficit Report");
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Diabetes - Adverse Event");
        clickElement(By.id("li-blank-Qualified"));
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textNotPresent("Vision Deficit Report");
    }

}
