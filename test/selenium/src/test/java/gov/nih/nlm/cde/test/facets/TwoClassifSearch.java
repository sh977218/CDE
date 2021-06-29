package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifSearch extends BoardTest {

    @Test
    public void twoClassificationSearch() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Neuromuscular Disease"));
        textPresent("NINDS > Disease > Neuromuscular Disease");

        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("and", By.id("searchResultInfoBar"));
        textPresent("(Select Orgs)", By.id("classifAlt_filter"));
        hangon(1);
        clickElement(By.id("classif-NINDS"));
        clickElement(By.id("classif-Domain"));
        clickElement(By.id("classif-Assessments and Examinations"));
        textPresent("NINDS > Domain > Assessments and Examinations", By.id("classifAlt_filter"));
        textPresent("Imaging Diagnostics (30");

        int numbOfImages = Integer.parseInt(findElement(By.id("nbOfClassifElts-Imaging Diagnostics")).getText());

        clickElement(By.id("classif-Imaging Diagnostics"));
        textPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));
        textPresent(numbOfImages + " data element results for");
        hangon(1);

        gotoPublicBoards();
        hangon(1);
        driver.navigate().back();
        textPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));

        clickElement(By.id("classifAlt_filter"));
        textNotPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));
        textPresent("Classification (100");

        clickElement(By.id("menu_cdes_link"));
        findElement(By.id("browseOrg-caCORE"));
        clickElement(By.id("browseOrg-NINDS"));
        checkSearchResultInfo(null, "NINDS", null, null, null);
    }

}
