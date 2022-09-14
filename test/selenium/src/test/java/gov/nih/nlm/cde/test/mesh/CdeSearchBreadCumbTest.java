package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchBreadCumbTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchBreadcrumb() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        Assert.assertEquals(driver.getTitle(), "Data Element Search");

        findElement(By.id("ftsearch-input")).sendKeys("type");
        hangon(2);
        clickElement(By.id("search.submit"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.xpath("//*[contains(@class, 'treeChild')][contains(., 'Domain')]"));
        clickElement(By.id("altClassificationFilterModeToggle"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.xpath("//*[contains(@class, 'treeChild')][contains(., 'Disease')]"));
        clickElement(By.id("regstatus-Qualified"));
        clickElement(By.id("datatype-Value List"));

        checkSearchResultInfo("type", new String[]{"NINDS", "Domain"}, new String[]{"NINDS", "Disease"},
                new String[]{"Qualified"}, new String[]{"Value List"});

        clickElement(By.className("datatype_crumb"));
        clickElement(By.className("status_crumb"));
        moveMouseToCoordinate(0, 0);
        clickElement(By.className("classif_crumb"));
        hangon(1);
        clickElement(By.className("classif_crumb"));
        clickElement(By.id("term_crumb"));

        isSearchWelcome();
    }
}
