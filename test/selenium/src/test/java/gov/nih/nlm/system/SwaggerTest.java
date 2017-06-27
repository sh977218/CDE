package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SwaggerTest extends NlmCdeBaseTest {
    @Test
    public void swaggerTest() {
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.partialLinkText("Swagger API Documentation"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        clickElement(By.partialLinkText("Form"));
        clickElement(By.partialLinkText("/formById/{tinyId}"));
        findElement(By.xpath("//*[@id='Form_get_formById_tinyId']//td[label[text()='tinyId']]/following-sibling::td/input"))
                .sendKeys("Xy1kuxJqm");
        clickElement(By.cssSelector("#Form_get_formById_tinyId input[type=submit]"));
        textPresent("590cc0da5b9fd620f835b547", By.cssSelector("#Form_get_formById_tinyId .response_body.json"));
    }
}
