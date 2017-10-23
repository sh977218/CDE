package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class NavigateThroughClassificationTreeTest extends NlmCdeBaseTest {

    @Test
    public void navigateThroughClassificationTree() {
        String cdeName = "McGill Quality of Life Questionnaire (MQOL) - two day total life quality score";
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName(cdeName);
        goToClassification();
        clickElement(By.id("openClassificationModalBtn"));
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("NINDS");
        textPresent("Domain", By.id("newClassifyItemModalBody"));
        textPresent("Population", By.id("newClassifyItemModalBody"));
        textNotPresent("Amyotrophic Lateral Sclerosis", By.id("newClassifyItemModalBody"));
        clickElement(By.id("Disease-expander"));
        textPresent("Amyotrophic Lateral Sclerosis", By.id("newClassifyItemModalBody"));
        textPresent("Domain", By.id("newClassifyItemModalBody"));
        textPresent("Population", By.id("newClassifyItemModalBody"));
        clickElement(By.id("Disease-expander"));
        textNotPresent("Amyotrophic Lateral Sclerosis", By.id("newClassifyItemModalBody"));
        clickElement(By.id("cancelNewClassifyItemBtn"));
        modalGone();
    }


}
