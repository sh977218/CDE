package gov.nih.nlm.cde.test.generalDetails;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLinkedFormDescriptionTruncateTest extends NlmCdeBaseTest {
    @Test
    public void cdeLinkedFormDescriptionTruncate() {
        String cdeName = "Patient Health Questionnaire (PHQ-9) Last Two Weeks How Often Little Interest or Pleasure in Doing Things Score 4 Point Scale";
        goToCdeByName(cdeName);
        textPresent("self-administered version of the PRIME-MD", By.className("formDetails"));
        textNotPresent("No permission required to reproduce, translate, display or distribute.", By.className("formDetails"));
    }

}
