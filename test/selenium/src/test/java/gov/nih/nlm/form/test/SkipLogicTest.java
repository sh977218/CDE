package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.Dimension;

public class SkipLogicTest extends BaseFormTest {
    
    QuestionTest questionTest = new QuestionTest();
    
    @Test
    public void singlePermissibleValue() {
        mustBeLoggedInAs(ctepCurator_username, password);    
        
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Cancer Screening Test";
        String formDef = "General Cancer Screening Test!";
        String formV = "0.1";
        createForm(formName, formDef, formV, "CTEP");        
        findElement(By.linkText("Form Description")).click();        
        new SectionTest().addSection("Patient Demographics", null);  
        new SectionTest().addSection("Female Patient Screening", null);
        findElement(By.id("startAddingQuestions")).click();          

        // Add 2nd Section
        questionTest.addQuestionToSection("Patient Gender Category", 0);
        questionTest.addQuestionToSection("Breast Carcinoma Estrogen Receptor Status", 1);             
        WebElement sourceElt = findElement(By.cssSelector("#section_view_1 .section-move-handle"));
        WebElement targetElt = findElement(By.id("section_drop_area_0"));
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        saveForm(); 
        findElement(By.linkText("Form Description")).click();        
        findElement(By.cssSelector(".section_view .section_view .skipLogicCondition")).sendKeys("\"Patient Gender Category\" = \"Female Gender\"");
        saveForm(); 
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("formPreview")).click();
        switchTab(1);
        
        textNotPresent("Female Patient Screening");
        new Select(findElement(By.xpath("//div[label[text()=\"Patient Gender Category\"]]/following-sibling::div//select"))).selectByValue("Female Gender");
        textPresent("Female Patient Screening");
                
        switchTabAndClose(0);
        
//        findElement(By.id("startAddingQuestions")).click(); 
//        questionTest.addQuestionToSection("Patient Race Category", 0);
//        findElement(By.id("startAddingQuestions")).click();
//        findElement(By.xpath("//span[text()=\"Patient Race Category\" and@id=\"question_accordion_0_1\"]")).click();
//        //new Select(findElement(By.xpath("//*[@id=\"question_1\"]//select[contains(@class, 'skipLogicSelectQuestion')]"))).selectByValue("Patient Gender Category");
//        //new Select(findElement(By.xpath("//*[@id=\"question_1\"]//select[contains(@class, 'skipLogicSelectAnswer')]"))).selectByValue("Female Gender");
//        findElement(By.xpath("//*[@id=\\\"question_1\\\"]//select[contains(@class, 'skipLogicSelectQuestion')]")).click();
//        saveForm(); 
        
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());        
    }
    
}
