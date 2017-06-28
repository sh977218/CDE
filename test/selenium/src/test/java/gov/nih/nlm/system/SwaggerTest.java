package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SwaggerTest extends NlmCdeBaseTest {
    @Test
    public void swaggerTest() {
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.partialLinkText("API Documentation"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        clickElement(By.partialLinkText("Form"));
        clickElement(By.partialLinkText("/formById/{tinyId}"));
        findElement(By.xpath("//*[@id='Form_get_formById_tinyId']//td[label[text()='tinyId']]/following-sibling::td/input"))
                .sendKeys("Xy1kuxJqm");
        clickElement(By.cssSelector("#Form_get_formById_tinyId input[type=submit]"));
        scrollToViewByXpath("//*[@id='Form_get_formById_tinyId']//*[contains(@class,'sandbox_header')]");
        textPresent("Xy1kuxJqm", By.cssSelector("#Form_get_formById_tinyId .response_body"));
    }
}
