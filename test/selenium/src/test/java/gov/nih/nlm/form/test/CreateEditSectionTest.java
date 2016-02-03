package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateEditSectionTest extends BaseFormTest {

    @Test
    public void createEditSection() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Section Test Form";

        goToFormByName(formName);
        clickElement(By.id("description_tab"));

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
        clickElement(By.id("description_tab"));

        clickElement(By.id("moveEltUp-1"));
        clickElement(By.id("moveEltDown-1"));

        saveForm();
        clickElement(By.id("description_tab"));

        Assert.assertEquals("Section 2", findElement(By.id("section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("section_title_2")).getText());

        clickElement(By.xpath("//div[@id='section_title_0']//i"));
        findElement(By.xpath("//div[@id='section_title_0']//input")).sendKeys(" - New");
        clickElement(By.xpath("//div[@id='section_title_0']//button[contains(text(),'Confirm')]"));

        clickElement(By.xpath("//div[@id='dd_card_1']//i"));
        new Select(findElement(By.xpath("//div[@id='dd_card_1']//select"))).selectByVisibleText("0 or 1");
        clickElement(By.xpath("//div[@id='dd_card_1']//button[@id='confirmCard']"));

        clickElement(By.xpath("//div[@id='section_title_2']//i"));
        findElement(By.xpath("//div[@id='section_title_2']//input")).sendKeys(" - New");
        clickElement(By.xpath("//div[@id='section_title_2']//button[text() = ' Discard']"));

        saveForm();
        clickElement(By.id("description_tab"));

        Assert.assertEquals("Section 2 - New", findElement(By.id("section_title_0")).getText());
        Assert.assertEquals("Section 3", findElement(By.id("section_title_1")).getText());
        Assert.assertEquals("Section 1", findElement(By.id("section_title_2")).getText());

        Assert.assertEquals("1 or more", findElement(By.id("dd_card_0")).getText());
        Assert.assertEquals("0 or 1", findElement(By.id("dd_card_1")).getText());
        Assert.assertEquals("0 or more", findElement(By.id("dd_card_2")).getText());

        clickElement(By.id("removeElt-1"));
        saveForm();
        clickElement(By.id("description_tab"));

        Assert.assertEquals("Section 1", findElement(By.id("section_title_1")).getText());
    }

}
