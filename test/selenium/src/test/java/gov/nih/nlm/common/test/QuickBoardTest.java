package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuickBoardTest extends NlmCdeBaseTest {

    @Test
    public void noSideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        clickElement(By.linkText("Quick Board (3)"));
        clickElement(By.xpath("//*[@id=\"qb.cde.tab\"]/a"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb_cde_compare_1"));
        clickElement(By.id("qb_cde_compare_2"));
        clickElement(By.id("qb.compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb.cde.empty"));
        textPresent("Quick Board (0)");
    }

    @Test
    public void sideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.xpath("//*[@id=\"qb.cde.tab\"]/a"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb_cde_compare_1"));
        clickElement(By.id("qb.cde.compare"));
        textPresent("View Full Detail");
        textPresent("Value used as a Standard Deviation in ALK");
        textPresent("Number of months from frontline platinum-based treatment");
        textPresent("ALK Standard Deviation");
        textPresent("Platinum free interval");
        textPresent("Permissible Values");

        findElement(By.linkText("Quick Board (2)")).click();
        findElement(By.id("qb.cde.empty")).click();
        textPresent("Quick Board (0)");
    }

    @Test
    public void expandAllQuickBoard() {
        goToCdeSearch();
        addToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.xpath("//*[@id=\"qb.cde.tab\"]/a"));
        clickElement(By.id("qb.cde.openCloseAll"));
        textPresent("AJCC Based:");
        textPresent("Value used as a Standard Deviation");

        clickElement(By.id("qb.cde.empty"));
        textPresent("Quick Board (0)");
    }

    @Test
    public void testQuickBoardButtons() {
        goToCdeSearch();
        addToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        textNotPresent("Loading...");
        clickElement(By.id("qb.cde.compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");

        clickElement(By.id("accordionView"));
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");

        clickElement(By.id("cde.gridView"));
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

        clickElement(By.id("accordionView"));
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");
        clickElement(By.id("qb.cde.compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }
}
