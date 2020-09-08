package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSearchFilterTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchByFilter() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();

        clickElement(By.id("search_by_classification_ACRIN"));
        textPresent("4 data element results for");
        textPresent("Under Review (2)");
        textPresent("Candidate (3)");
        textPresent("Incomplete (1)");
        textPresent("Value List (3)");
        textPresent("Number (1)");

        clickElement(By.xpath("//*[@id='regstatus-Candidate']/*[@class='treeItemText']"));
        textPresent("3 data element results for");
        textPresent("Under Review (1)");
        textPresent("Candidate (3)");
        textPresent("Incomplete (1)");
        textPresent("Value List (2)");
        textPresent("Number (1)");

        clickElement(By.xpath("//*[@id='datatype-Value List']/*[@class='treeItemText']"));
        textPresent("2 data element results for");
        textPresent("Candidate (3)");
        textPresent("Incomplete (1)");
        textPresent("Value List (2)");
        textPresent("Number (1)");
    }

}