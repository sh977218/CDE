package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RenderRequiredFieldsTest extends NlmCdeBaseTest {


    private boolean isRequired(WebElement element) {
        return "true".equals(element.getAttribute("required"));
    }

    @Test
    public void requiredFields() {
        goToFormByName("Required Field Form");
        clickElement(By.linkText("native"));

        Assert.assertFalse(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[1]"))));
        Assert.assertTrue(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[2]"))));

        Assert.assertFalse(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[3]"))));
        Assert.assertTrue(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[4]"))));

        Assert.assertFalse(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[5]"))));
        Assert.assertTrue(isRequired(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[6]"))));

    }

}