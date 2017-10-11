package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SwaggerTest extends NlmCdeBaseTest {
    @Test
    public void swaggerApi() {
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.id("apiDocumentationLink"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        clickElement(By.partialLinkText("Form"));
        hangon(5);
        clickElement(By.partialLinkText("/form/{tinyId}"));
        clickElement(By.xpath("//*[@id='Form_get_form_tinyId']/div[contains(@class,'heading')]"));
        findElement(By.xpath("//*[@id='Form_get_form_tinyId_content']//td[label[text()='tinyId']]/following-sibling::td/input"))
                .sendKeys("Xy1kuxJqm");
        clickElement(By.cssSelector("#Form_get_form_tinyId_content input[type=submit]"));
        scrollToViewByXpath("//*[@id='Form_get_form_tinyId_content']//*[contains(@class,'response_body')]");
        textPresent("Xy1kuxJqm", By.xpath("//*[@id='Form_get_form_tinyId_content']//*[contains(@class,'response_body')]"));
    }
}
