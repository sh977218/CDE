package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSectionTest extends BaseFormTest {
    
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
        scrollToTop();
        findElement(By.linkText("Form Description")).click();

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
