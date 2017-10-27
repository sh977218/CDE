package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CuratorLowStatusSearch extends NlmCdeBaseTest {

    @Test
    public void curatorLowStatusSearch() {
        mustBeLoggedOut();
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("Qualified (");
        textNotPresent("Candidate (");
        setVisibleStatus("minStatus-Candidate");
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.cssSelector("i.fa-search"));
        findElement(By.id("li-blank-Candidate"));
        textPresent("caCORE (");

        mustBeLoggedInAs(cabigAdmin_username, password);
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("caCORE (");
        clickElement(By.id("li-blank-Candidate"));
        textNotPresent("caCORE (");
    }

}
