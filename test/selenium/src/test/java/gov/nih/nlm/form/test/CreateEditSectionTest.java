package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
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

        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        Assert.assertEquals("Section 1", findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 2", findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 3", findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]")).getText());


        Assert.assertEquals("0 or more", findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[2]/div[4]/div[2]/select")).getText());
        Assert.assertEquals("1 or more", findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[2]/div[4]/div[2]/select")).getText());
        Assert.assertEquals("Exactly 1", findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[2]/div[4]/div[2]/select")).getText());
    }

}
