package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EmptyCdeQuickboard extends NlmCdeBaseTest {
    @Test
    public void emptyCdeQuickBoardTest() {
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        textPresent("Quick Board (1)");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        textPresent("Quick Board (3)");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (4)");
        addCdeToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_de_empty"));
        textPresent("CDE QuickBoard (0)");
    }
}
