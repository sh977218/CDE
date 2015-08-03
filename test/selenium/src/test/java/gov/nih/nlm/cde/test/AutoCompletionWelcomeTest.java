package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.concurrent.TimeUnit;

import static com.jayway.restassured.RestAssured.given;

public class AutoCompletionWelcomeTest extends NlmCdeBaseTest {
    @Test
    public void AutoCompletionWelcome() {
        goToSearch("cde");
        String search_input = "Winter will be cold";
        findElement(By.id("ftsearch-input")).sendKeys(search_input);
        findElement(By.id("search.submit")).click();
        textPresent("results for Winter will be cold");
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("Wint");
        String search_string = findElement(By.xpath("//div[@id='searchDiv']//li[contains(@id,'typeahead-')][1]")).getText();
        Assert.assertTrue(search_string.toLowerCase().contains(search_input.toLowerCase()));

    }
}