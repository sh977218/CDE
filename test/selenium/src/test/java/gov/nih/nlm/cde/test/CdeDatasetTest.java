package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeDatasetTest extends BaseClassificationTest {

    @Test
    public void cdeCheckDatasetExistTest() {
        String cdeName = "Immunology Gonorrhea Assay Laboratory Finding Result";
        goToCdeByName(cdeName);
        goToRelatedContent();
        goToDatasets();
        textPresent("phv00000369.v1.p1");
    }
}
