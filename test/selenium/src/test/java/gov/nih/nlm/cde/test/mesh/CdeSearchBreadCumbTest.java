package gov.nih.nlm.cde.test.mesh;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchBreadCumbTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchBreadcrumb() {
        goToCdeSearch();
        Assert.assertEquals(driver.getTitle(), "Data Element Search");

        findElement(By.id("ftsearch-input")).sendKeys("type");
        hangon(2);
        clickElement(By.id("search.submit"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.partialLinkText("Domain"));
        clickElement(By.id("altClassificationFilterModeToggle"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.partialLinkText("Disease"));
        textPresent("NINDS > Disease");
        clickElement(By.id("regstatus-Qualified"));
        clickElement(By.id("datatype-Value List"));

        checkSearchResultInfo("type", "NINDS > Domain", "NINDS > Disease", "Qualified", "Value List");

        clickElement(By.id("datatype_crumb"));
        clickElement(By.id("status_crumb"));
        clickElement(By.id("classif_crumb"));
        hangon(1);
        clickElement(By.id("classif_crumb"));
        clickElement(By.id("term_crumb"));

        isSearchWelcome();
    }
}
