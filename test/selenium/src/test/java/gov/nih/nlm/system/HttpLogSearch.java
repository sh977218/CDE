package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.FluentWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Predicate;

public class HttpLogSearch extends NlmCdeBaseTest {

    @Test
    public void searchHttpLog() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.id("searchBtn"));


        findElement(By.id("fromDate")).sendKeys("01012000");
        findElement(By.id("fromDate")).sendKeys(Keys.TAB);
        findElement(By.id("fromDate")).sendKeys("0101P");

        findElement(By.id("toDate")).sendKeys("01012030");
        findElement(By.id("toDate")).sendKeys(Keys.TAB);
        findElement(By.id("toDate")).sendKeys("0101P");
        clickElement(By.id("searchBtn"));
        textPresent("200");

        String ipTerm = findElement(By.cssSelector("td.ip")).getText();

        clickElement(By.cssSelector(".mat-paginator-navigation-next"));
        clickElement(By.xpath("//th[. = 'Method']"));
        textPresent("200");

        // do bad query to wipe result.
        findElement(By.name("ip")).sendKeys("badIP");
        clickElement(By.id("searchBtn"));
        textNotPresent(ipTerm);

        findElement(By.name("ip")).clear();
        findElement(By.name("ip")).sendKeys(ipTerm);
        clickElement(By.id("searchBtn"));
        clickElement(By.cssSelector(".mat-paginator-navigation-previous"));
        textPresent(ipTerm);
        List<WebElement> ips = driver.findElements(By.cssSelector(".ip"));
        for (WebElement ip : ips) {
            Assert.assertEquals(ip.getText().trim(), ipTerm);
        }
    }

}
