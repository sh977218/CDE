package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class NonEditableAnswers extends NlmCdeBaseTest {

    @Test
    public void nonEditableAnswers() {
        goToFormByName("Non Editable Questions");
        Assert.assertFalse(findElement(By.xpath("//div[contains(@id, 'Noncompliant')]//input")).isEnabled());
        List<WebElement> radios = findElements(By.xpath("//div[contains(@id, 'Race Category')]//input"));
        Assert.assertEquals(radios.size(), 7);
        for (WebElement e : radios) {
            Assert.assertFalse(e.isEnabled());
        }
        Assert.assertFalse(findElement(By.xpath("//div[contains(@id, 'Birth')]//input")).isEnabled());
        Assert.assertFalse(findElement(By.xpath("//div[contains(@id, 'Adverse')]//input")).isEnabled());
    }

}
