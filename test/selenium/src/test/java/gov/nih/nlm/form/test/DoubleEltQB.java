package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DoubleEltQB extends NlmCdeBaseTest {

    @Test
    public void doubleElementedQuickboard(){
        mustBeLoggedInAs(ninds_username, password);
        addFormToQuickBoard("King-Devick Concussion Screening Test (K-D Test)");
        addFormToQuickBoard("Hamilton Anxiety Rating Scale (HAM-A)");
        hoverOverElement(findElement(By.id("boardsMenu")));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_compare"));
        textPresent("Baseline Attempt Time #1 Total Time");
        textPresent("Contains data elements which rate the severity of the participant/subject's level of anxiety. (Examples of CDEs included: Anxious mood; Tension; Fears; etc.)");
    }


}
