package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class SwaggerTest extends NlmCdeBaseTest {

    private void checkSwagger() {
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.id("apiDocumentationLink"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//a")).click();
        for (int i = 0; i < 5; i++) {
            findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[. = 'Try it out ']")));
            hangon(1);
        }
        findElement(By.xpath("//button[. = 'Try it out ']")).click();
        for (int i = 0; i < 3; i++) {
            findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//input")));
            hangon(1);
        }
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//input")).sendKeys("Xy1kuxJqm");
        for (int i = 0; i < 5; i++) {
            findElement(By.cssSelector("body")).sendKeys(Keys.ARROW_DOWN);
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[. = 'Execute']")));
            hangon(1);
        }
        findElement(By.xpath("//button[. = 'Execute']")).click();
        textPresent("Undifferentiated/Indeterminant/Intersex");
    }


    @Test
    public void formTinyIdSwaggerApi() {
    }

    @Test
    public void formTinyIdVersionSwaggerApi() {
    }
}
