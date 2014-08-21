package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;
import org.testng.Assert;

public class FormSearchTest extends BaseFormTest {
    @Test
    public void formFacets() {
        gotoPublicForms();
        searchForm("FormSearchTest");
        Assert.assertTrue(textPresent("Skin Cancer Patient"));
        Assert.assertTrue(textPresent("Traumatic Brain Injury - Adverse Events"));
        Assert.assertTrue(textPresent("Vision Deficit Report"));        
        Assert.assertTrue(textPresent("Qualified"));      
        findElement(By.id("status-text-Qualified")).click(); 
        Assert.assertTrue(textPresent("Skin Cancer Patient"));
        Assert.assertTrue(textPresent("Traumatic Brain Injury - Adverse Events"));        
        Assert.assertTrue(textNotPresent("Vision Deficit Report"));   
        findElement(By.id("status-text-Qualified")).click();     
        Assert.assertTrue(textPresent("Skin Cancer Patient"));
        Assert.assertTrue(textPresent("Traumatic Brain Injury - Adverse Events"));        
        Assert.assertTrue(textPresent("Vision Deficit Report"));
        findElement(By.id("status-text-Recorded")).click();  
        Assert.assertTrue(textNotPresent("Skin Cancer Patient"));
        Assert.assertTrue(textNotPresent("Traumatic Brain Injury - Adverse Events"));
        Assert.assertTrue(textPresent("Vision Deficit Report"));    
        findElement(By.id("status-text-Recorded")).click();  
        Assert.assertTrue(textPresent("Skin Cancer Patient"));
        Assert.assertTrue(textPresent("Traumatic Brain Injury - Adverse Events"));
        Assert.assertTrue(textPresent("Vision Deficit Report"));
    }    
}
