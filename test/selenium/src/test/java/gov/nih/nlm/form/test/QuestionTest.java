package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class QuestionTest extends BaseFormTest {
    
    public void addQuestionToSection(String cdeName, int sectionNumber) {
        findElement(By.id("resetSearch")).click();
        hangon(1);
        findElement(By.name("ftsearch")).sendKeys("\"" + cdeName + "\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results");        
        textPresent(cdeName, By.id("acc_link_0"));
        
        WebElement sourceElt = findElement(By.cssSelector("#accordionList .question-move-handle"));
        WebElement targetElt = findElement(By.id("section_drop_area_" + sectionNumber));
        
        Assert.assertTrue(sourceElt.isDisplayed());
        Assert.assertTrue(targetElt.isDisplayed());
        
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        hangon(2);
    }    
    
    public void addQuestionToSectionSafe(String cdeName, int sectionNumber) {
        findElement(By.id("resetSearch")).click();
        hangon(1);
        findElement(By.name("ftsearch")).sendKeys("\"" + cdeName + "\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results");
        textPresent(cdeName, By.id("accordionList"));
        
        WebElement sourceElt = findElement(By.xpath("//div[@id='accordionList']//i[contains(@class, 'question-move-handle')]"));
        WebElement targetElt = findElement(By.xpath("//*[text()=\"Patient Gender Category\"]"));
        
        Assert.assertTrue(sourceElt.isDisplayed());
        Assert.assertTrue(targetElt.isDisplayed());
        
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
    }       
    
    @Test
    public void questions() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, password);

        String formName = "Questions Form Test";
        String formDef = "Form to test adding questions. ";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        findElement(By.linkText("Form Description")).click();
        
        new CreateEditSectionTest().addSection("Patient Information", null);
        
        startAddingQuestions();

        // Check status facet.
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("Qualified (94"));
        findElement(By.id("li-blank-caBIG")).click();
        Assert.assertTrue(textPresent("Qualified (1"));
        findElement(By.id("resetSearch")).click();

        // check pagination
        Assert.assertEquals(12, driver.findElements(By.xpath("//ul[@items-per-page='20']/li")).size());
        findElement(By.id("classifications-text-AECC")).click();
        hangon(1);
        Assert.assertEquals(driver.findElements(By.xpath("//ul[@items-per-page='20']/li")).size(), 3);
        
        addQuestionToSection("Person Birth Date", 0);

        Assert.assertEquals("Person Birth Date", findElement(By.id("question_accordion_0_0")).getText());
        findElement(By.id("question_accordion_0_0")).click();
        
        findElement(By.xpath("//dd[@id='dd_question_title_0']//i")).click();
        findElement(By.xpath("//div[@id='q_select_name_3']//button")).click();
        hangon(1);
        Assert.assertEquals("Date of Birth", findElement(By.id("dd_question_title_0")).getText());
 
        String instXPath = "//dd[@id='dd_question_instructions_0']";

        Assert.assertEquals("N/A", findElement(By.id("dd_question_instructions_0")).getText());
        findElement(By.xpath(instXPath +  "//i")).click();
        findElement(By.xpath(instXPath + "//input")).sendKeys("Instructions for PBD");
        findElement(By.xpath(instXPath + "//button[text() = ' Confirm']")).click();
        
        Assert.assertFalse(findElement(By.xpath("//dd[@id='dd_question_required_0']/input")).isSelected());
        findElement(By.xpath("//dd[@id='dd_question_required_0']//input")).click();
        
        String cardXPath = "//dd[@id='dd_q_card_0']";
        Assert.assertEquals("Exactly 1", findElement(By.xpath(cardXPath)).getText().trim());
        findElement(By.xpath(cardXPath + "//i")).click();
        new Select(findElement(By.xpath(cardXPath + "//select"))).selectByVisibleText("1 or more");
        findElement(By.xpath(cardXPath + "//button[text() = ' Confirm']")).click();
        
        String uomXPath = "//dd[@id='dd_q_uoms_0']";
        Assert.assertEquals("N/A", findElement(By.xpath(uomXPath + "/div")).getText());
        findElement(By.xpath(uomXPath + "//button")).click();
        
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//button[text() = ' Confirm']")).click();
        
        List<WebElement> uoms = driver.findElements(By.xpath(uomXPath + "//div[contains(@id, 'q_uom_list_')]"));
        Assert.assertEquals(0, uoms.size());

        findElement(By.xpath(uomXPath + "//button[contains(., 'Add')]")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).sendKeys("PBD UOM 1");
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//button[text() = ' Confirm']")).click();
        hangon(.5);

        findElement(By.xpath(uomXPath + "//button[contains(., 'Add')]")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//input")).sendKeys("PBD UOM 2");
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//button[text() = ' Confirm']")).click();
        
        String oldFormUrl = driver.getCurrentUrl();
        
        textPresent("This element is not saved.");
        saveForm();
        String newFormUrl = driver.getCurrentUrl();
        textNotPresent("This element is not saved.");

        findElement(By.linkText("Form Description")).click();

        Assert.assertEquals("Date of Birth", findElement(By.id("question_accordion_0_0")).getText());
        findElement(By.id("question_accordion_0_0")).click();
        Assert.assertEquals("Date of Birth", findElement(By.id("dd_question_title_0")).getText());
        Assert.assertEquals("Instructions for PBD", findElement(By.id("dd_question_instructions_0")).getText());
        Assert.assertTrue(findElement(By.xpath("//dd[@id='dd_question_required_0']/input")).isSelected());
        Assert.assertEquals("1 or more", findElement(By.xpath(cardXPath)).getText().trim());
        Assert.assertEquals("DATE", findElement(By.id("dd_datatype_0")).getText().trim());

        Assert.assertEquals("PBD UOM 1", findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']")).getText());
        
        driver.get(newFormUrl);
        findElement(By.linkText("Form Description")).click();
        startAddingQuestions();    

        // Add 2nd Section
        new CreateEditSectionTest().addSection("Smoking Status", null);

        addQuestionToSection("Smoking History Ind", 1);
        findElement(By.id("question_accordion_1_0")).click();
        hangon(1);
        Assert.assertEquals("Value List", findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_datatype_0']")).getText().trim());
        Assert.assertFalse(findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).isSelected());
        stopAddingQuestions();
        findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).click();
//        startAddingQuestions();
        saveForm();

        findElement(By.linkText("Form Description")).click();
        findElement(By.id("question_accordion_1_0")).click();

        Assert.assertTrue(findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).isSelected());

        // hide search CDE
        findElement(By.id("startAddingQuestions")).click();

        WebElement sourceElt = findElement(By.xpath("//div[@id='section_drop_area_1']//div[@id='question_0']//i[contains(@class, 'question-move-handle')]"));
        WebElement targetElt = findElement(By.id("section_drop_area_0"));
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        saveForm();

        findElement(By.linkText("Form Description")).click();
        findElement(By.id("question_accordion_0_0")).click();
        hangon(1);
        Assert.assertEquals(2, driver.findElements(By.xpath("//div[@id='section_drop_area_0']//div[starts-with(@id, 'question_')]")).size());

        findElement(By.id("remove_q_0")).click();
        findElement(By.id("remove_q_0")).click();

        saveForm();
        findElement(By.linkText("Form Description")).click();
        Assert.assertEquals(0, driver.findElements(By.xpath("//div[@id='section_drop_area_0']//div[starts-with(@id, 'question_')]")).size());

        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

}
