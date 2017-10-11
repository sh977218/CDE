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
        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div/span[2]/a"));
        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[2]/div[1]/div[2]/button"));
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[2]/div[2]/table/tbody/tr/td[2]/input"))
                .sendKeys("Xy1kuxJqm");
        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[3]/button"));
        textPresent("Xy1kuxJqm", By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[4]/div[2]/div/div/table/tbody/tr/td[2]/div[1]/pre"));
    }
}
