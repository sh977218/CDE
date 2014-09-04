package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SectionTest extends BaseFormTest {

            
    @Test
    public void createForm() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);

        String formName = "Create Form Test Name";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        Assert.assertTrue(textPresent(formName));
        Assert.assertTrue(textPresent(formDef));
        Assert.assertTrue(textPresent(formV));
        
        gotoPublicForms();
        searchForm("Create Form Test Name");
        findElement(By.linkText("Create Form Test Name")).click();
        Assert.assertTrue(textPresent("Fill out carefully!"));        
    }    
    
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
    
    void addSection(String title, String card) {
        int nbOfSections = driver.findElements(By.xpath("//div[starts-with(@id, 'section_view')]")).size();

        findElement(By.id("addSection")).click();

        String section_title_path = "//dd[@id='dd_section_title_" + nbOfSections + "']";
        findElement(By.xpath(section_title_path + "//i")).click();
        findElement(By.xpath(section_title_path + "//input")).clear();
        findElement(By.xpath(section_title_path + "//input")).sendKeys(title);
        findElement(By.xpath(section_title_path + "//button[@class='fa fa-check']")).click();
    
        if (card != null) {
            findElement(By.xpath("//i[@id='edit_section_card_" + nbOfSections + "']")).click();
            new Select(findElement(By.xpath("//select[@id='select_section_card_"  + nbOfSections + "']"))).selectByVisibleText(card);
            findElement(By.xpath("//dd[@id='dd_card_" + nbOfSections + "']//button[@id='confirmCard']")).click();
        }
    }
    
    @Test
    public void createEditSection() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String formName = "Section Test Form";
        createForm(formName, "Form def", "1.0", "CTEP");
        
        addSection("Section 1", "0 or more");
        addSection("Section 2", "1 or more");
        addSection("Section 3", null);

        Assert.assertEquals("Section 1", findElement(By.id("dd_section_title_0")).getText());
        Assert.assertEquals("Section 2", findElement(By.id("dd_section_title_1")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("dd_section_title_2")).getText());

        Assert.assertEquals("0 or more", findElement(By.id("dd_card_0")).getText());
        Assert.assertEquals("1 or more", findElement(By.id("dd_card_1")).getText());
        Assert.assertEquals("Exactly 1", findElement(By.id("dd_card_2")).getText());

        saveForm();
        
        findElement(By.id("moveEltUp-1")).click();
        findElement(By.id("moveEltDown-1")).click();
        
        saveForm();

        Assert.assertEquals("Section 2", findElement(By.id("dd_section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("dd_section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("dd_section_title_2")).getText());
        
        findElement(By.xpath("//dd[@id='dd_section_title_0']//i")).click();
        findElement(By.xpath("//dd[@id='dd_section_title_0']//input")).sendKeys(" - New");
        findElement(By.xpath("//dd[@id='dd_section_title_0']//button[@class='fa fa-check']")).click();
        
        findElement(By.xpath("//dd[@id='dd_card_1']//i")).click();
        new Select(findElement(By.xpath("//dd[@id='dd_card_1']//select"))).selectByVisibleText("0 or 1");
        findElement(By.xpath("//dd[@id='dd_card_1']//button[@id='confirmCard']")).click();
        
        findElement(By.xpath("//dd[@id='dd_section_title_2']//i")).click();
        findElement(By.xpath("//dd[@id='dd_section_title_2']//input")).sendKeys(" - New");
        findElement(By.xpath("//dd[@id='dd_section_title_2']//button[@class='fa fa-times']")).click();

        saveForm();
        
        Assert.assertEquals("Section 2 - New", findElement(By.id("dd_section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("dd_section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("dd_section_title_2")).getText());

        Assert.assertEquals("1 or more", findElement(By.id("dd_card_0")).getText());
        Assert.assertEquals("0 or 1", findElement(By.id("dd_card_1")).getText());
        Assert.assertEquals("0 or more", findElement(By.id("dd_card_2")).getText());

        findElement(By.id("removeElt-1")).click();
        saveForm();
        
        Assert.assertEquals("Section 1", findElement(By.id("dd_section_title_1")).getText());

        
    }
}
