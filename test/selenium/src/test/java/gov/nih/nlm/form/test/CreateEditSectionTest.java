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

        addSectionTop("Section 1", null);
        addSectionBottom("Section 2", "1 or more");
        addSectionBottom("Section 3", "0 or more");

        saveForm();

        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        scrollToInfiniteById("section_2");
        Assert.assertEquals("Section 1", findElement(By.xpath("//*[@id='section_0']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 2", findElement(By.xpath("//*[@id='section_1']/div/div[1]/div[1]")).getText());
        Assert.assertEquals("Section 3", findElement(By.xpath("//*[@id='section_2']/div/div[1]/div[1]")).getText());


        textNotPresent("Exactly 1", By.xpath("//*[@id='section_0']//*[contains(@class,'section_cardinality')]"));
        textPresent("1 or more", By.xpath("//*[@id='section_1']//*[contains(@class,'section_cardinality')]"));
        textPresent("0 or more", By.xpath("//*[@id='section_2']//*[contains(@class,'section_cardinality')]"));
    }

}
