package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormFacetsTest extends BaseFormTest {

    @Test
    public void formFacets() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormSearch();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        clickElement(By.id("regstatus-Qualified"));
        textNotPresent("Vision Deficit Report");
        findElement(By.xpath("//*[contains(@class,'status_crumb')][contains(.,'Qualified')]"));

        clickElement(By.id("regstatus-Recorded"));
        textPresent("Vision Deficit Report");
        assertSearchFilterSelected("regstatus-Recorded", true);
        clickElement(By.id("regstatus-Recorded"));
        hangon(1);
        clickElement(By.id("regstatus-Candidate"));
        hangon(1);
        assertSearchFilterSelected("regstatus-Qualified", true);
        clickElement(By.id("regstatus-Qualified"));
        textNotPresent("Vision Deficit Report");
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Diabetes - Adverse Event");
        clickElement(By.id("regstatus-Qualified"));
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textNotPresent("Vision Deficit Report");
    }

}
