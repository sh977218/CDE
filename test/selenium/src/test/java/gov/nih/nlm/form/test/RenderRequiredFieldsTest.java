package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class RenderRequiredFieldsTest extends NlmCdeBaseTest {

    @Test
    public void requiredFields() {
        goToFormByName("Required Field Form");
        clickElement(By.linkText("native"));
        List<WebElement> inputs = findElements(By.xpath("//div[@id='formRenderSection_New Section']//input"));

        Assert.assertFalse(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[1]")), "required"));
        Assert.assertTrue(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[2]")), "required"));

        Assert.assertFalse(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[3]")), "required"));
        Assert.assertTrue(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[4]")), "required"));

        Assert.assertFalse(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[5]")), "required"));
        Assert.assertTrue(isAttributePresent(
                findElement(By.xpath("(//div[@id='formRenderSection_New Section']//input)[6]")), "required"));

    }

}
