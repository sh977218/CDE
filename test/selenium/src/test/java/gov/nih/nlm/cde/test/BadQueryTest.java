package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BadQueryTest extends NlmCdeBaseTest {

    @Test
    public void badQuery() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("brain neoplasms\"$:{(.#%@!~");
        findElement(By.cssSelector(".fa-search")).click();
        textPresent("results for brain neoplasms | All Class");
    }

}
