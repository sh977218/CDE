package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeQuickBoardTest1 extends NlmCdeBaseTest {

    @Test
    public void cdeMoreElementsNoSideBySideCompare() {
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void cdeLessElementsNoSideBySideCompare() {
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_cde_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void cdeSideBySideCompare() {
        mustBeLoggedInAs(test_username,password);
        addCdeToQuickBoard("cdeCompare1");
        addCdeToQuickBoard("cdeCompare2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_cde_compare"));

        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'leftObj')]/a"));
        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'rightObj')]/a"));

        textPresent("TEST", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("TEST", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("Incomplete", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));
        textPresent("Incomplete", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));

        textNotPresent("cdeCompare1", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("cdeCompare2", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("cdeCompare1", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("cdeCompare2", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("reference document title 1", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("reference document title 2", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("reference document title 1", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("reference document title 2", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("key 1", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("key 2", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("key 1", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("key 2", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("concept name 1", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("concept name 2", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("concept name 1", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("concept name 2", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void cdeExpandAllQuickBoard() {
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_cde_openCloseAll"));
        textPresent("AJCC Based:");
        textPresent("Value used as a Standard Deviation");

        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void testQuickBoardButtons() {
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

        clickElement(By.id("cde_accordionView"));
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");

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

        clickElement(By.id("cde_accordionView"));
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");
        clickElement(By.id("qb_cde_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }

}
