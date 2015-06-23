package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ExpandAllQuickBoardTest extends NlmCdeBaseTest {

    @Test
    public void expandAllQuickBoard() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );

        textPresent("Quick Board ( 2 )");

        findElement(By.linkText("Quick Board ( 2 )")).click();

        findElement(By.id("qb.openCloseAll")).click();
        textPresent("AJCC Based:");
        textPresent("Value used as a Standard Deviation");

        findElement(By.id("qb.empty")).click();
        textPresent("Quick Board ( empty )");
    }

    @Test
    public void testQuickBoardButtons() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );

        textPresent("Quick Board ( 2 )");

        findElement(By.linkText("Quick Board ( 2 )")).click();
        textNotPresent("Loading...");

        hangon(1);

        findElement(By.id("qb.compare")).click();
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");

        findElement(By.id("accordionView")).click();
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");

        findElement(By.id("gridView")).click();
        textPresent("NX");
        textPresent("pN0");
        textPresent("Pathologic N Stage");
        textPresent("NUMBER");
        textPresent("3028594");
        textPresent("3436564");
        textPresent("Fluorescence in situ ");
        textPresent("Standard");
        textPresent("Qualified");
        textNotPresent("NCI Thesaurus");

        findElement(By.id("accordionView")).click();
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");

        findElement(By.id("qb.compare")).click();
        hangon(5);
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }

}
