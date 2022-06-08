package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifSearch extends BoardTest {

    @Test
    public void twoClassificationSearch() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Neuromuscular Disease"));
        checkSearchResultInfo(null, new String[]{"NINDS", "Disease", "Neuromuscular Disease"}, null, null, null);

        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("and", By.className("searchFilterLayoutActive"));
        textPresent("(Select Orgs)", By.className("classifAlt_filter"));
        hangon(1);
        clickElement(By.id("classif-NINDS"));
        clickElement(By.id("classif-Domain"));
        clickElement(By.id("classif-Assessments and Examinations"));
        checkSearchResultInfo(null, null, new String[]{"NINDS", "Domain", "Assessments and Examinations"}, null, null);
        textPresent("Imaging Diagnostics (30");

        int numbOfImages = Integer.parseInt(findElement(By.id("nbOfClassifElts-Imaging Diagnostics")).getText());

        clickElement(By.id("classif-Imaging Diagnostics"));
        checkSearchResultInfo(null, null, new String[]{"NINDS", "Domain", "Assessments and Examinations", "Imaging Diagnostics"}, null, null);
        textPresent(numbOfImages + " results. Sorted by relevance.");
        hangon(1);

        goHome();
        hangon(1);
        driver.navigate().back();
        checkSearchResultInfo(null, null, new String[]{"NINDS", "Domain", "Assessments and Examinations", "Imaging Diagnostics"}, null, null);

        clickElement(By.className("classifAlt_filter"));
        String altSection = "//*[contains(@class,'classifAlt_filter')]";
        searchNoActiveFilter("NINDS", altSection);
        searchNoActiveFilter("Domain", altSection);
        searchNoActiveFilter("Assessments and Examinations", altSection);
        searchNoActiveFilter("Imaging Diagnostics", altSection);
        textPresent("Classification (100");

        clickElement(By.id("menu_cdes_link"));
        findElement(By.id("browseOrg-caCORE"));
        clickElement(By.id("browseOrg-NINDS"));
        checkSearchResultInfo(null, new String[]{"NINDS"}, null, null, null);
    }

}
