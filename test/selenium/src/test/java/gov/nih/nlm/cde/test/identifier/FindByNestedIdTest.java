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
        goToIdentifiers();
        addNewIdentifier("caDSR", "C18059", "3");
        newCdeVersion();

        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("ids.id:C18059");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));

        try {
            textPresent("2 data element results");
        } catch (Exception e) {
            goToCdeSearch();
            findElement(By.id("ftsearch-input")).sendKeys("ids.id:C18059");
            clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        }
        textPresent("2 data element results");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("flatIds:\"caDSR C18059\"");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        textPresent("1 data element results");

    }

}
