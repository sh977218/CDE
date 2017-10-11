package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class SwaggerTest extends NlmCdeBaseTest {

    void click(By by) {
        Actions builder = new Actions(driver);
        builder.moveToElement(driver.findElement(by)).click().build().perform();
    }

    @Test
    public void swaggerApi() {
//        clickElement(By.id("dropdownMenu_help"));
//        clickElement(By.id("apiDocumentationLink"));
//        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
//        textPresent("CDE API");
//        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div/span[2]/a"));
//        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[2]/div[1]/div[2]/button"));
//        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[2]/div[2]/table/tbody/tr/td[2]/input"))
//                .sendKeys("Xy1kuxJqm");
//        clickElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[3]/button"));
//        textPresent("Xy1kuxJqm", By.xpath("//*[@id='operations-Form-get_form__tinyId_']/div[2]/div/div[4]/div[2]/div/div/table/tbody/tr/td[2]/div[1]/pre"));
/*
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.id("apiDocumentationLink"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        click(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//a"));
        click(By.xpath("//button[. = 'Try it out ']"));
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//input")).sendKeys("Xy1kuxJqm");
        click(By.xpath("//button[. = 'Execute']"));
        textPresent("Undifferentiated/Indeterminant/Intersex");
*/
        clickElement(By.id("dropdownMenu_help"));
        clickElement(By.id("apiDocumentationLink"));
        driver.switchTo().frame(findElement(By.cssSelector("iframe")));
        textPresent("CDE API");
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//a")).click();
        String script = "((JavascriptExecutor) driver).executeScript('window.scrollTo(0,0)');";
        ((JavascriptExecutor) driver).executeAsyncScript(script, "");
        hangon(5);
        findElement(By.xpath("//button[. = 'Try it out ']")).click();
        findElement(By.xpath("//*[@id='operations-Form-get_form__tinyId_']//input")).sendKeys("Xy1kuxJqm");
        findElement(By.xpath("//button[. = 'Execute']")).click();
        textPresent("Undifferentiated/Indeterminant/Intersex");
    }
}
