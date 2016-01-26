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

        Assert.assertFalse(isAttributePresent(inputs.get(0), "required"));
        Assert.assertTrue(isAttributePresent(inputs.get(1), "required"));

        Assert.assertFalse(isAttributePresent(inputs.get(2), "required"));
        Assert.assertTrue(isAttributePresent(inputs.get(3), "required"));

        Assert.assertFalse(isAttributePresent(inputs.get(4), "required"));
        Assert.assertTrue(isAttributePresent(inputs.get(5), "required"));

    }

}
