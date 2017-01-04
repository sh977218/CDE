package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.IdentifiersTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeIdentifierTest extends IdentifiersTest {

    @Test
    public void addRemoveCdeId() {
        addRemoveId("Prostatectomy Performed Date", null);
    }

    @Test
    public void findByNestedId() {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName("Ohio State TBI Method Short Form (OSUTBIMS) - ask question category");
        showAllTabs();
        // same ID as "more injuries loss of consciousness number"
        addId("FAKE", "C18059", "3");

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

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }

    @Test
    public void loincLink() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Ethnicity USA maternal category");
        showAllTabs();
        clickElement(By.id("ids_tab"));
        clickElement(By.id("addId"));
        findElement(By.name("source")).sendKeys("LOINC");
        findElement(By.name("id")).sendKeys("59362-4");
        clickElement(By.id("createId"));
        textPresent("Identifier Added");
        closeAlert();
        findElement(By.linkText("59362-4"));
    }
}
