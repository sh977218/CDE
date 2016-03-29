package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EnglishAnalyzer extends NlmCdeBaseTest {

    @Test
    public void englishAnalyzer() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("\"medical food\"");
        findElement(By.id("search.submit")).click();
        textPresent("Medical Foods");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("of");
        findElement(By.id("search.submit")).click();
        textPresent("0 results for of");
    }

}
