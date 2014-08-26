package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearchTest extends BaseFormTest {
    @Test
    public void formFacets() {
        gotoPublicForms();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");        
        textPresent("Qualified");      
        findElement(By.id("status-text-Qualified")).click(); 
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");        
        textNotPresent("Vision Deficit Report");   
        findElement(By.id("status-text-Qualified")).click();     
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");        
        textPresent("Vision Deficit Report");
        findElement(By.id("status-text-Recorded")).click();  
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");    
        findElement(By.id("status-text-Recorded")).click();  
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");
    }    
}
