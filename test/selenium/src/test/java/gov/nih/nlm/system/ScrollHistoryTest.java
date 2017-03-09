package gov.nih.nlm.system;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

public class ScrollHistoryTest extends NlmCdeBaseTest {

    @Test
    public void scrollHistory() {
        searchEltAny("apple", "cde");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(500) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_4"));
        hangon(1);

        searchEltAny("patient", "form");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(550) + ");", "");
        hangon(1);

        clickElement(By.id("linkToElt_5"));
        hangon(1);

        searchEltAny("pain", "cde");
        hangon(1);
        ((JavascriptExecutor) driver).executeScript("$(window).scrollTop(" + Integer.toString(600) + ");", "");
        hangon(1);

        driver.navigate().refresh();
        hangon(1);
        Assert.assertEquals(600L, ((JavascriptExecutor) driver).executeScript("return $(window).scrollTop();", ""));

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        hangon(1);
        Assert.assertEquals(550L, ((JavascriptExecutor) driver).executeScript("return $(window).scrollTop();", ""));

        driver.navigate().back();
        driver.navigate().back();
        driver.navigate().back();
        hangon(1);
        Assert.assertEquals(500L, ((JavascriptExecutor) driver).executeScript("return $(window).scrollTop();", ""));
    }
}
