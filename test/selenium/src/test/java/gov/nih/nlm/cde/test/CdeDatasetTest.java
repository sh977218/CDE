package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeDatasetTest extends BaseClassificationTest {

    @Test
    @RecordVideo
    public void cdeCheckDatasetExistTest() {
        String cdeName = "Immunology Gonorrhea Assay Laboratory Finding Result";
        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("dataSet_tab"));
        textPresent("phv00000369.v1.p1");
    }
}
