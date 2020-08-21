package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoCreatedAtEpoch extends NlmCdeBaseTest {
    @Test
    public void noCreatedAtEpoch() {
        search("cde", "created:<1971");
        findElement(By.xpath("//*[@id='searchResultInfoBar'][contains(.,'0 results for')]/span[@id='term_crumb'][contains(.,'created:<1971')]"));

        search("form", "created:<1971");
        findElement(By.xpath("//*[@id='searchResultInfoBar'][contains(.,'4 results for')]/span[@id='term_crumb'][contains(.,'created:<1971')]"));
    }

    public void search(String type, String searchString) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys(searchString);

        // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        hangon(0.5);
        clickElement(By.id("search.submit"));

        textPresent("results for");
    }
}
