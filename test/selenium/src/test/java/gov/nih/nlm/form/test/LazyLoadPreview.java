package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LazyLoadPreview extends NlmCdeBaseTest {

    @Test
    public void lazyLoadPreview() {
        goToFormByName("Family History - Affected Relatives and Pedigree");
        textNotPresent("Where Done");
        clickElement(By.id("renderPreviewButton"));
        textPresent("Where Done");
    }

}
