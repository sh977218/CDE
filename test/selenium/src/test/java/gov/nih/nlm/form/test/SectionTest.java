package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.Dimension;

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
    
    @Test
    public void questionsLayoutTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Question Layout Test Form";
        String formDef = "This form is used to test the permission of tests";
        String formV = "0.1";

        createForm(formName, formDef, formV, "CTEP");
        
        String sec1 = "first section";
        String sec2 = "second section";
        
        addSection(sec1, "0 or more");
        addSection(sec2, "0 or more");
        
        textPresent(sec1);
        textPresent(sec2);
        
        textPresent("Show Question Search Area");
        findElement(By.id("startAddingQuestions")).click();
        textPresent("Hide Question Search Area");
        textPresent("results for");
        
        findElement(By.id("showHideFilters")).click();
        textPresent("Show Filters");
        
        findElement(By.id("removeElt-1")).click();
        textNotPresent(sec2);
        findElement(By.id("removeElt-0")).click();
        textNotPresent(sec1);
        
        textPresent("There is no content yet.");
        
        String sec3 = "thrid section";
        addSection(sec3, "0 or more");
        
        textNotPresent("Show Filters");
        textNotPresent("results for");
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

    @Test
    public void formPermissionTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Form Permission Test";
        
        gotoPublicForms();
        searchForm(formName);
        findElement(By.linkText(formName)).click();
        hangon(1);
        findElement(By.id("openEltInCurrentTab_0")).click();
        
        String sec1 = "test permission section";
        addSection(sec1, "0 or more");
        textPresent(sec1);
        saveForm();
        
        mustBeLoggedInAs(ctepCurator_username, password);
        gotoPublicForms();
        searchForm(formName);
        findElement(By.linkText(formName)).click();
        findElement(By.id("openEltInCurrentTab_0")).click();
        textNotPresent("Delete");
        textNotPresent("Add Section");
        textNotPresent("Show Question Search Area");
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }
    
    @Test
    public void dragHandleVisibility() {
        mustBeLoggedOut();
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        Assert.assertEquals(findElement(By.cssSelector("div.formSectionArea")).findElements(By.cssSelector("i.question-move-handle")).size(), 0);
        Assert.assertEquals(driver.findElements(By.cssSelector("i.section-move-handle")).size(), 0);

        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Intraoperative Management");
        findElement(By.linkText("Form Description")).click();
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.question-move-handle"));
        findElement(By.cssSelector("div.formSectionArea")).findElement(By.cssSelector("i.section-move-handle"));
    }
    
}
