package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;

public class UrlSearch extends NlmCdeBaseTest {

    public void urlSearch() {
        setVisibleStatus("minStatus-Qualified");
        goToCdeSearch();
        findElement(By.id("browseOrg-caBIG"));
        String curUrl = driver.getCurrentUrl();
        driver.get(curUrl + "regStatus=Candidate");
        textPresent("All Terms | caBIG | Candidate");
    }

}
