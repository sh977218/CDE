package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;
import static com.jayway.restassured.RestAssured.get;

public class BadQueryTest extends NlmCdeBaseTest {

    @Test
    public void badQuery() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("brain neoplasms\"$:{(.#%@!~");
        findElement(By.cssSelector(".fa-search")).click();
        textPresent("Disease or Disorder Central Nervous System Neoplasm Status Type");
    }

}
