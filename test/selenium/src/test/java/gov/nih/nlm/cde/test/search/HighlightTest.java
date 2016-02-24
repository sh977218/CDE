package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HighlightTest extends NlmCdeBaseTest {

    @Test
    public void highlights() {

        // highlight - no fragment
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"using OMB Approved\"");
        textPresent("the patient's self declared racial origination, independent of ethnic origination, using OMB approved categories");

        // highlight with fragment
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"enzymatic processing of a polypeptide\"");
        clickElement(By.id("search.submit"));

        textPresent("A compound of two or more amino acids where the al [...] request for and delivery of a file (such as a Web page) on a server.:The enzymatic processing of a polypeptide chain");

        // no highlights
        goToCdeSearch();
        clickElement(By.id("browseOrg-caCORE"));
        clickElement(By.id("li-blank-Mage-OM"));
        textPresent("A note acknowledging a source of information or quoting a passage._A person who edits material for publication; a person having managerial and sometimes policy-making responsibility for the editorial ...");

    }


}
