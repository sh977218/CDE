package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.regstatus.FormRegStatus;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class QuestionTest2 extends BaseFormTest {
   
    private QuestionTest questionTest = new QuestionTest();
    
    @Test
    public void answerList() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, password);

        String formName = "Answer List Test";
        String formDef = "Form to test answer lists ";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        findElement(By.linkText("Form Description")).click();

        new SectionTest().addSection("Answer List Section", null);
        
        startAddingQuestions();
        questionTest.addQuestionToSection("Patient Gender Category", 0);
        findElement(By.id("question_accordion_0_0")).click();
        hangon(1);

        List<WebElement> lis = driver.findElements(By.xpath("//div[@id = 'question_0']//ul[@class='select2-choices']//li/span/span"));
        Assert.assertEquals(lis.size(), 3);
        Assert.assertEquals(lis.get(0).getText(), "Female Gender");
        Assert.assertEquals(lis.get(1).getText(), "Male Gender");
        Assert.assertEquals(lis.get(2).getText(), "Unknown");

        findElement(By.xpath("//div[@id='question_0']//ul[@class='select2-choices']//li[1]/a")).click();
        textNotPresent("Female Gender");
        lis = driver.findElements(By.xpath("//div[@id = 'question_0']//ul[@class='select2-choices']//li/span/span"));
        Assert.assertEquals(lis.size(), 2);
        Assert.assertEquals("Male Gender", lis.get(0).getText());
        Assert.assertEquals("Unknown", lis.get(1).getText());
        
        saveForm();
        
        new FormRegStatus().changeRegistrationStatus(formName, ctepCurator_username, "Incomplete", "Qualified");
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());

    }
    
    @Test
    public void otherPleaseSpecify() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Other Please Specify Test";
        String formDef = "Form to test other please specify";

        createForm(formName, formDef, null, "CTEP");
        
        findElement(By.linkText("Form Description")).click();

        new SectionTest().addSection("Basic Section", null);
        
        startAddingQuestions();
        questionTest.addQuestionToSection("Patient Gender Category", 0);

        findElement(By.id("question_accordion_0_0")).click();
        hangon(1);
        
        // Remove Unknown
        findElement(By.xpath("//div[@id='question_0']//ul[@class='select2-choices']//li[1]/a")).click();

        findElement(By.id("input_otherPleaseSpecify")).click();
        
        saveForm();

        findElement(By.id("formPreview")).click();
        switchTab(1);
        textPresent("Patient Gender Category");
        
        new Select(findElement(By.cssSelector("select"))).selectByValue("otherPleaseSpecify");
        findElement(By.xpath("//input[@placeholder='Please Specify']")).sendKeys("Transgender");
        
        switchTabAndClose(0);
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());

    }
    
    @Test
    public void sectionInSection() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Cancer Patient Data Collection";
        String formDef = "Section in Section";
        String formV = "0.1";
        createForm(formName, formDef, formV, "CTEP");        
        findElement(By.linkText("Form Description")).click();        
        new SectionTest().addSection("Medical History", null);  
        new SectionTest().addSection("Treatment Details", null);
        startAddingQuestions();          

        // Add 2nd Section
        questionTest.addQuestionToSection("Smoking History Ind", 0);
        questionTest.addQuestionToSection("First-Line Therapy Chemotherapy Regimen Name", 1);             
        WebElement sourceElt = findElement(By.xpath("//div[@id=\"section_view_1\"]//i[contains(@class,\"section-move-handle\")]"));
        WebElement targetElt = findElement(By.xpath("//div[@id=\"section_drop_area_0\"]//*[@id=\"question_accordion_0_0\"]"));
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        hangon(1);
        
        String cardXPath = "//*[contains(@class,'dragQuestions')]//dd[@id='dd_card_0']";
        Assert.assertEquals("Exactly 1", findElement(By.xpath(cardXPath)).getText().trim());
        findElement(By.xpath(cardXPath + "//i")).click();
        new Select(findElement(By.xpath(cardXPath + "//select"))).selectByVisibleText("1 or more");
        findElement(By.xpath(cardXPath + "//button[text() = ' Confirm']")).click();
        
        saveForm();        
        goToFormByName(formName, "Incomplete");
        findElement(By.linkText("Form Description")).click();        
        findElement(By.xpath("//div[@id=\"section_drop_area_0\"]//div[@id=\"section_drop_area_child\"]//span[text()=\"First-Line Therapy Chemotherapy Regimen Name\"]")); 
        
        findElement(By.id("formPreview")).click();
        switchTab(1);
        findElement(By.xpath("//div[@id=\"formRenderSection_Medical History\"]//div[@id=\"formRenderSection_Treatment Details\"]//label[text()='First-Line Therapy Chemotherapy Regimen Name']"));        
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()=\"Treatment Details\"]")).size() == 1); 
        findElement(By.xpath("//*[text()=\" Add One\"]")).click();
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()=\"Treatment Details\"]")).size() == 2);              
        switchTabAndClose(0);
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());        
    }
    
    
}
