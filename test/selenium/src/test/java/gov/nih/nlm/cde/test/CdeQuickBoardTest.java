package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeQuickBoardTest extends NlmCdeBaseTest {

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
        textPresent("Quick Board (0)");
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
        textPresent("Quick Board (0)");
    }

    @Test
    public void cdeSideBySideCompare() {
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
        textPresent("Quick Board (0)");
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
        textPresent("Quick Board (0)");
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

        clickElement(By.id("cde.accordionView"));
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

        clickElement(By.id("cde.accordionView"));
        textNotPresent("Prostate Cancer pN0 TNM Finding");
        textNotPresent("Prostate Tumor Pathologic N Stage");
        textNotPresent("NCI Thesaurus");
        clickElement(By.id("qb_cde_compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }

    public void emptyQuickBoardByModule(String module) {
        if (findElement(By.id("menu_qb_link")).getText().contains("( empty )")) return;
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_" + module + "_empty"));
        textPresent((module == "cde" ? "CDE" : "Form") + " QuickBoard ( empty )");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        hangon(1);
    }

    @Test
    public void goToEmptyQuickBoard() {
        goHome();
        textPresent("Quick Board (0)");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        textPresent("CDE QuickBoard ( empty )");
        textPresent("Form QuickBoard ( empty )");
        textPresent("The quick board is empty.");

    }

    @Test
    public void emptyCdeQuickBoardTest() {
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        addCdeToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        clickElement(By.id("qb_cde_empty"));
        clickElement(By.linkText("CDE QuickBoard ( empty )"));
    }

    @Test
    public void showGridViewInCdeQuickBoard() {
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        addCdeToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        textPresent("Generalized Activities of Daily Living Pain Restricted Scale");
        hangon(1);
        waitAndClick(By.id("cde_gridView"));
        textPresent("3436564");
        textPresent("pN0");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("2320242");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard ( empty )");
    }

    @Test
    public void removeOneFromCdeQuickBoard() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-OHSU Knight"));
        textPresent("4 results for");
        clickElement(By.id("addToCompare_0"));
        clickElement(By.id("addToCompare_1"));
        clickElement(By.id("addToCompare_2"));
        String toRemove = findElement(By.id("acc_link_2")).getText();
        clickElement(By.id("addToCompare_3"));
        hangon(.5);
        goToQuickBoardByModule("cde");
        hangon(.5);
        textPresent(toRemove);
        List<WebElement> pluses = findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        clickElement(By.id("remove_2"));
        hangon(.5);
        pluses = findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        textNotPresent(toRemove);
    }
}
