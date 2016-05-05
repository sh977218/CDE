package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AutoCompletionWelcomeTest extends NlmCdeBaseTest {

    @Test
    public void AutoCompletionWelcome() {
        goToSearch("cde");
        String search_input = "Winter will be cold";
        findElement(By.id("ftsearch-input")).sendKeys(search_input);
        clickElement(By.id("search.submit"));
        textPresent("results for Winter will be cold");
        waitForESUpdate();
        goToSearch("cde");
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("Wint");
        String search_string = findElement(By.xpath("//div[@id='searchDiv']//li[contains(@id,'typeahead-')][1]/a")).getText();
        Assert.assertTrue(search_string.toLowerCase().contains(search_input.toLowerCase()));
    }
}