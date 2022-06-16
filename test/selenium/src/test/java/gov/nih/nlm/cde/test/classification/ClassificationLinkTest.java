package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClassificationLinkTest extends NlmCdeBaseTest {
    @Test
    public void classificationLink() {
        String cdeName = "Spectroscopy water signal removal filter text";
        goToCdeByName(cdeName);
        goToClassification();
        clickElement(By.xpath("//*[@id='Disease,Amyotrophic Lateral Sclerosis,Domain,Assessments and Examinations,Imaging Diagnostics']"));
        showSearchFilters();
        textPresent("Collections");
        textPresent("NINDS");
        textPresent("Imaging Diagnostics");
    }

}
