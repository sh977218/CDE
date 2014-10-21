package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchTest extends NlmCdeBaseTest {

    @Test
    public void saveSearchState() {
        goToCdeSearch();
        findElement(By.xpath("//i[@id=\"li-blank-CTEP\"]")).click();
        findElement(By.xpath("//i[@id=\"li-blank-CATEGORY\"]")).click();
        findElement(By.xpath("//i[@id=\"li-blank-Qualified\"]")).click();
        findElement(By.name("ftsearch")).sendKeys("name");
        findElement(By.id("search.submit")).click();     
        textPresent("results for CTEP : CATEGORY | name | Qualified");
        findElement(By.linkText("Forms")).click();     
        textNotPresent("CATEGORY");
        findElement(By.linkText("CDEs")).click();     
        textPresent("results for CTEP : CATEGORY | name | Qualified");
    }
    
}
