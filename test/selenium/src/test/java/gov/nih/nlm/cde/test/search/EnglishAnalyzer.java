package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EnglishAnalyzer extends NlmCdeBaseTest {

    @Test
    public void englishAnalyzer() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("\"Physical exam perform\"");
        findElement(By.id("search.submit")).click();
        textPresent("Physical exam performed indicator");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("of");
        findElement(By.id("search.submit")).click();
        textPresent("0 data element results for of");
    }

}
