package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoCreatedAtEpoch extends NlmCdeBaseTest {
    @Test
    public void noCreatedAtEpoch() {
        search("cde", "created:<1971");
        textPresent("No results were found.");
        search("form", "created:<1971");
        findElement(By.xpath("//*[@id='searchResultInfoBar'][contains(.,'4 form results')]"));
        textPresent("created:<1971", By.id("term_crumb"));
    }

    public void search(String type, String searchString) {
        goToSearch(type);
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys(searchString);

        // Wait for ng-model of ftsearch to update. Otherwise angular sometime sends incomplete search:  ' "Fluoresc ' instead of ' "Fluorescent sample CDE" '
        hangon(0.5);
        clickElement(By.id("search.submit"));

        textPresent("results ");
    }
}
