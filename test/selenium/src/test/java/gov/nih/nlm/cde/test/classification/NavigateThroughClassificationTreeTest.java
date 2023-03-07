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
        textPresent("Domain", By.tagName("mat-dialog-container"));
        textPresent("Population", By.tagName("mat-dialog-container"));
        textNotPresent("Amyotrophic Lateral Sclerosis", By.tagName("mat-dialog-container"));
        classifyToggle(new String[]{"Disease"});
        textPresent("Amyotrophic Lateral Sclerosis", By.tagName("mat-dialog-container"));
        textPresent("Domain", By.tagName("mat-dialog-container"));
        textPresent("Population", By.tagName("mat-dialog-container"));
        classifyToggle(new String[]{"Disease"});
        textNotPresent("Amyotrophic Lateral Sclerosis", By.tagName("mat-dialog-container"));
        clickElement(By.xpath("//button[contains(.,'Close')]"));
        modalGone();
    }

}
