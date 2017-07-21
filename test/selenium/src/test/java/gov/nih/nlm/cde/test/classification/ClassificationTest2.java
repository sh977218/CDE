package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ClassificationTest2 extends BaseClassificationTest {

    @Test
    public void navigateThroughClassificationTree() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("McGill Quality of Life Questionnaire (MQOL) - two day total life quality score");
        clickElement(By.id("classification_tab"));
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
