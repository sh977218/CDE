package gov.nih.nlm.form.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.Dimension;

public class QuestionTest extends BaseFormTest {
    
    @Test
    public void questions() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1024, 1150);
        
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);

        String formName = "Questions Form Test";
        String formDef = "Form to test adding questions. ";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");
        
        findElement(By.linkText("Form Description")).click();
        
        new SectionTest().addSection("Patient Information", null);
        
        findElement(By.id("startAddingQuestions")).click();

        // Check status facet.
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("Qualified (4"));
        findElement(By.id("li-blank-caBIG")).click();
        findElement(By.cssSelector("i.fa-check-square-o"));
        Assert.assertTrue(textPresent("Qualified (1"));
        findElement(By.id("resetSearch")).click();

        // check pagination
        Assert.assertEquals(12, driver.findElements(By.xpath("//ul[@items-per-page='20']/li")).size());
        findElement(By.id("classifications-text-AECC")).click();
        hangon(1);
        Assert.assertEquals(3, driver.findElements(By.xpath("//ul[@items-per-page='20']/li")).size());
        
        
        findElement(By.name("ftsearch")).sendKeys("\"person birth date\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results");
        
        WebElement sourceElt = findElement(By.id("acc_link_0"));
        WebElement targetElt = findElement(By.id("section_drop_area_0"));
        
        Assert.assertTrue(sourceElt.isDisplayed());
        Assert.assertTrue(targetElt.isDisplayed());
        
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();

        Assert.assertEquals("Person Birth Date", findElement(By.id("question_accordion_0_0")).getText());
        findElement(By.id("question_accordion_0_0")).click();
        
        findElement(By.xpath("//dd[@id='dd_question_title_0']//i")).click();
        modalHere();
        findElement(By.xpath("//div[@id='q_select_name_3']//button")).click();
        hangon(1);
        Assert.assertEquals("Date of Birth", findElement(By.id("dd_question_title_0")).getText());
 
        String instXPath = "//dd[@id='dd_question_instructions_0']";

        Assert.assertEquals("N/A", findElement(By.id("dd_question_instructions_0")).getText());
        findElement(By.xpath(instXPath +  "//i")).click();
        findElement(By.xpath(instXPath + "//input")).sendKeys("Instructions for PBD");
        findElement(By.xpath(instXPath + "//button[@class='fa fa-check']")).click();
        
        Assert.assertFalse(findElement(By.xpath("//dd[@id='dd_question_required_0']/input")).isSelected());
        findElement(By.xpath("//dd[@id='dd_question_required_0']//input")).click();
        
        String cardXPath = "//dd[@id='dd_q_card_0']";
        Assert.assertEquals("Exactly 1", findElement(By.xpath(cardXPath)).getText().trim());
        findElement(By.xpath(cardXPath + "//i")).click();
        new Select(findElement(By.xpath(cardXPath + "//select"))).selectByVisibleText("1 or more");
        findElement(By.xpath(cardXPath + "//button[@class='fa fa-check']")).click();
        
        String uomXPath = "//dd[@id='dd_q_uoms_0']";
        Assert.assertEquals("N/A", findElement(By.xpath(uomXPath + "/div")).getText());
        findElement(By.xpath(uomXPath + "//button")).click();
        
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//button[@class='fa fa-check']")).click();
        
        List<WebElement> uoms = driver.findElements(By.xpath(uomXPath + "//div[contains(@id, 'q_uom_list_')]"));
        Assert.assertEquals(0, uoms.size());

        findElement(By.xpath(uomXPath + "//button[contains(., 'Add')]")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//input")).sendKeys("PBD UOM 1");
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_0']//button[@class='fa fa-check']")).click();
        hangon(.5);

        findElement(By.xpath(uomXPath + "//button[contains(., 'Add')]")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//i")).click();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//input")).clear();
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//input")).sendKeys("PBD UOM 2");
        findElement(By.xpath(uomXPath + "//div[@id='q_uom_list_1']//button[@class='fa fa-check']")).click();
        
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
        
        // check archived can't be edited
        driver.get(oldFormUrl);
        textPresent("this form is archived");
        
        driver.get(newFormUrl);
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("startAddingQuestions")).click();    

        // Add 2nd Section
        new SectionTest().addSection("Smoking Status", null);

        findElement(By.id("resetSearch")).click();
        findElement(By.name("ftsearch")).sendKeys("\"smoking history ind\"");
        findElement(By.id("search.submit")).click();
        textPresent("1 results");

        sourceElt = findElement(By.id("acc_link_0"));
        targetElt = findElement(By.id("section_drop_area_1"));

        scrollTo("1000");
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        findElement(By.id("question_accordion_1_0")).click();

        Assert.assertEquals("Value List", findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_datatype_0']")).getText().trim());
        Assert.assertFalse(findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).isSelected());

        findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).click();
//        scrollTo("1000");
        saveForm();
        
        findElement(By.linkText("Form Description")).click();
        findElement(By.id("question_accordion_1_0")).click();

        Assert.assertTrue(findElement(By.xpath("//div[@id='section_drop_area_1']//dd[@id='dd_question_multi_0']//input")).isSelected());

        findElement(By.id("startAddingQuestions")).click();

        sourceElt = findElement(By.xpath("//div[@id='section_drop_area_1']//div[@id='question_0']"));
        targetElt = findElement(By.id("section_drop_area_0"));
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
//        scrollTo("1000");
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
