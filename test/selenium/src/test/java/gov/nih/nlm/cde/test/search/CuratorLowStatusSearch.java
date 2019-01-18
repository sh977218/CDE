package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CuratorLowStatusSearch extends NlmCdeBaseTest {

    @Test
    public void curatorLowStatusSearch() {
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        textPresent("Qualified (");
        textNotPresent("Candidate (");
        setVisibleStatus("minStatus-Candidate");
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        findElement(By.id("regstatus-Candidate"));
        textPresent("caCORE (");

        mustBeLoggedInAs(cabigAdmin_username, password);
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("java");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'search']"));
        textPresent("caCORE (");
        clickElement(By.id("regstatus-Candidate"));
        textNotPresent("caCORE (");
    }

}
