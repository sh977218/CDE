package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SectionTest extends BaseFormTest {
            
    @Test
    public void createForm() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String formName = "Create Form Test Name";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        Assert.assertTrue(textPresent(formName));
        Assert.assertTrue(textPresent(formDef));
        Assert.assertTrue(textPresent(formV));
        
        goToFormByName("Create Form Test Name", "Incomplete");
        textPresent("Fill out carefully!");        
    }
    
    @Test
    public void formFacets() {
        gotoPublicForms();
        searchForm("FormSearchTest");
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textNotPresent("Vision Deficit Report");        
        textPresent(", Qualified");      
        findElement(By.id("li-blank-Recorded")).click(); 
        textPresent("Skin Cancer Patient");
        textPresent("Traumatic Brain Injury - Adverse Events");        
        textPresent("Vision Deficit Report");   
        findElement(By.id("li-checked-Qualified")).click();     
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");        
        textPresent("Vision Deficit Report");
        findElement(By.id("li-checked-Recorded")).click();  
        textPresent("0 results for");
        findElement(By.id("li-blank-Recorded")).click();  
        textNotPresent("Skin Cancer Patient");
        textNotPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Vision Deficit Report");
    }    
    
    public void addSection(String title, String card) {
        int nbOfSections = driver.findElements(By.xpath("//div[starts-with(@id, 'section_view')]")).size();
        scrollToTop();
        findElement(By.linkText("Form Description")).click();

        findElement(By.id("addSection")).click();

        String section_title_path = "//div[@id='section_title_" + nbOfSections + "']";
        findElement(By.xpath(section_title_path + "//i")).click();
        findElement(By.xpath(section_title_path + "//input")).clear();
        findElement(By.xpath(section_title_path + "//input")).sendKeys(title);
        findElement(By.xpath(section_title_path + "//button[text()=' Confirm']")).click();
    
        if (card != null) {
            findElement(By.xpath("//i[@id='edit_section_card_" + nbOfSections + "']")).click();
            new Select(findElement(By.xpath("//select[@id='select_section_card_"  + nbOfSections + "']"))).selectByVisibleText(card);
            findElement(By.xpath("//dd[@id='dd_card_" + nbOfSections + "']//button[@id='confirmCard']")).click();
        }
    }
    
    @Test
    public void createEditSection() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Section Test Form";
        createForm(formName, "Form def", "1.0", "CTEP");

        findElement(By.linkText("Form Description")).click();
        
        addSection("Section 1", "0 or more");
        addSection("Section 2", "1 or more");
        addSection("Section 3", null);

        Assert.assertEquals("Section 1", findElement(By.id("section_title_0")).getText());
        Assert.assertEquals("Section 2", findElement(By.id("section_title_1")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("section_title_2")).getText());

        Assert.assertEquals("0 or more", findElement(By.id("dd_card_0")).getText());
        Assert.assertEquals("1 or more", findElement(By.id("dd_card_1")).getText());
        Assert.assertEquals("Exactly 1", findElement(By.id("dd_card_2")).getText());

        saveForm();
        findElement(By.linkText("Form Description")).click();

        findElement(By.id("moveEltUp-1")).click();
        findElement(By.id("moveEltDown-1")).click();
        
        saveForm();
        findElement(By.linkText("Form Description")).click();

        Assert.assertEquals("Section 2", findElement(By.id("section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("section_title_2")).getText());
        
        findElement(By.xpath("//div[@id='section_title_0']//i")).click();
        findElement(By.xpath("//div[@id='section_title_0']//input")).sendKeys(" - New");
        findElement(By.xpath("//div[@id='section_title_0']//button[text() = ' Confirm']")).click();
        
        findElement(By.xpath("//dd[@id='dd_card_1']//i")).click();
        new Select(findElement(By.xpath("//dd[@id='dd_card_1']//select"))).selectByVisibleText("0 or 1");
        findElement(By.xpath("//dd[@id='dd_card_1']//button[@id='confirmCard']")).click();
        
        findElement(By.xpath("//div[@id='section_title_2']//i")).click();
        findElement(By.xpath("//div[@id='section_title_2']//input")).sendKeys(" - New");
        findElement(By.xpath("//div[@id='section_title_2']//button[text() = ' Discard']")).click();

        saveForm();
        findElement(By.linkText("Form Description")).click();
        
        Assert.assertEquals("Section 2 - New", findElement(By.id("section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("section_title_2")).getText());

        Assert.assertEquals("1 or more", findElement(By.id("dd_card_0")).getText());
        Assert.assertEquals("0 or 1", findElement(By.id("dd_card_1")).getText());
        Assert.assertEquals("0 or more", findElement(By.id("dd_card_2")).getText());

        findElement(By.id("removeElt-1")).click();
        saveForm();
        findElement(By.linkText("Form Description")).click();
        
        Assert.assertEquals("Section 1", findElement(By.id("section_title_1")).getText());

        
    }

}
