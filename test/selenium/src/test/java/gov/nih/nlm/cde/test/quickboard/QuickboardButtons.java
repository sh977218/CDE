package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuickboardButtons extends NlmCdeBaseTest{
    @Test
    public void quickBoardButtons() {
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");

        clickElement(By.id("cde_summaryView"));
        findElement(By.linkText("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage"));

        clickElement(By.id("cde_gridView"));
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

        clickElement(By.id("cde_summaryView"));
        findElement(By.linkText("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage"));

        clickElement(By.id("qb_cde_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }}