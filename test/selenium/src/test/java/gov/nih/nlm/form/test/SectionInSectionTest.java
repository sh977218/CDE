package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SectionInSectionTest extends BaseFormTest {

    private QuestionTest questionTest = new QuestionTest();

    //@Test
    public void sectionInSection() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);        
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Cancer Patient Data Collection";
        String formDef = "Section in Section";
        String formV = "0.1";
        createForm(formName, formDef, formV, "CTEP");        
        findElement(By.linkText("Form Description")).click();        
        new CreateEditSectionTest().addSection("Medical History", null);
        new CreateEditSectionTest().addSection("Treatment Details", null);
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

        findElement(By.linkText("General Details")).click();

        findElement(By.xpath("//div[@id=\"formRenderSection_Medical History\"]//div[@id=\"formRenderSection_Treatment Details\"]//label[text()='First-Line Therapy Chemotherapy Regimen Name']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()=\"Treatment Details\"]")).size() == 1); 
        findElement(By.xpath("//*[text()=\" Add One\"]")).click();
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()=\"Treatment Details\"]")).size() == 2);              

        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }
    
    
}
