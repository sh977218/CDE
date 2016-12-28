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

        addSection("Section 1", null, "top");
        addSection("Section 2", "1 or more", "bottom");
        addSection("Section 3", "0 or more", "bottom");

        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        Assert.assertEquals("Section 1", findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 2", findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 3", findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]")).getText());


        Assert.assertNotEquals("Exactly 1", new Select(findElement(By.xpath("//*[@id='section_0']//*[contains(@class,'section_cardinality')]/select"))).getFirstSelectedOption());
        Assert.assertEquals("1 or more", new Select(findElement(By.xpath("//*[@id='section_1]//*[contains(@class,'section_cardinality')]/select"))).getFirstSelectedOption());
        Assert.assertNotEquals("0 or more", new Select(findElement(By.xpath("//*[@id='section_2']//*[contains(@class,'section_cardinality')]/select"))).getFirstSelectedOption());
    }

}
