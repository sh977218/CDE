package gov.nih.nlm.quickBoard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuickboardButtons extends NlmCdeBaseTest{

    @Test
    public void quickBoardButtons() {
        goHome();
        hoverOverElement(findElement(By.id("boardsMenu")));
        textPresent("Quick Board (0)");
        goToQuickBoardByModule("cde");
        textNotPresent("Side by Side View");
        textNotPresent("Table View");
        textNotPresent("Empty Quick Board");
        textNotPresent("Export Quick Board");

        goToQuickBoardByModule("form");
        textNotPresent("Side by Side View");
        textNotPresent("Table View");
        textNotPresent("Empty Quick Board");
        textNotPresent("Export Quick Board");

        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        hoverOverElement(findElement(By.id("boardsMenu")));
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        textPresent("Prostate Cancer American Joint Committee");
        textPresent("Fluorescence in situ");
        clickElement(By.id("qb_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
        clickElement(By.id("closeCompareSideBySideBtn"));

        // counteract save summary/table view
        if (driver.findElements(By.id("list_summaryView")).size() > 0)
            clickElement(By.id("list_summaryView"));
        findElement(By.linkText("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage"));

        clickElement(By.id("list_gridView"));
        textPresent("NX");
        textPresent("pN0");
        textPresent("Pathologic N Stage");
        textPresent("Number");
        textPresent("3028594");
        textPresent("3436564");
        textPresent("Fluorescence in situ ");
        textPresent("Standard");
        textPresent("Qualified");
        textNotPresent("NCI Thesaurus");

        clickElement(By.id("list_summaryView"));
        findElement(By.linkText("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage"));

        clickElement(By.id("qb_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }
}
