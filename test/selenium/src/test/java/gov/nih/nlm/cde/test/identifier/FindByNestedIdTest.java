package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FindByNestedIdTest extends NlmCdeBaseTest {
    @Test
    public void findByNestedId() {
        String cdeName = "Ohio State TBI Method Short Form (OSUTBIMS) - ask question category";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        // same ID as "more injuries loss of consciousness number"
        addIdentifier("FAKE", "C18059", "3");

        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("ids.id:C18059");
        clickElement(By.cssSelector("i.fa-search"));

        try {
            textPresent("2 results for");
        } catch (Exception e) {
            goToCdeSearch();
            findElement(By.id("ftsearch-input")).sendKeys("ids.id:C18059");
            clickElement(By.cssSelector("i.fa-search"));
        }
        textPresent("2 results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("flatIds:\"FAKE C18059\"");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("1 results for");

    }

}
