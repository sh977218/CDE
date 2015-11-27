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
        clickElement(By.linkText("Quick Board (3)"));
        clickElement(By.xpath("//*[@id=\"qb_cde_tab\"]/a"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb_cde_compare_1"));
        clickElement(By.id("qb_cde_compare_2"));
        clickElement(By.id("qb.cde.compare"));
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
        clickElement(By.linkText("Quick Board (3)"));
        clickElement(By.xpath("//*[@id=\"qb_cde_tab\"]/a"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb.cde.compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_cde_empty"));
        textPresent("Quick Board (0)");
    }

    @Test
    public void cdeSideBySideCompare() {
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        textPresent("Quick Board (2)");
        clickElement(By.id("menu_qb_link"));
        clickElement(By.xpath("//*[@id=\"qb_cde_tab\"]/a"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb_cde_compare_1"));
        clickElement(By.id("qb.cde.compare"));

        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'leftObj')]/a"));
        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'rightObj')]/a"));

        textPresent("SPOREs", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("caBIG", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("Qualified", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));
        textPresent("Qualified", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));

        textNotPresent("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][1]//*[contains(@class, 'rightObj')]"));
        textNotPresent("Platinum free interval (month", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][2]//*[contains(@class, 'leftObj')]"));
        textPresent("Platinum free interval (month", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][2]//*[contains(@class, 'rightObj')]"));
        textPresent("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][3]//*[contains(@class, 'leftObj')]"));
        textNotPresent("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][3]//*[contains(@class, 'rightObj')]"));
        textPresent("ALK Standard Deviation", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][4]//*[contains(@class, 'leftObj')]"));
        textNotPresent("ALK Standard Deviation", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareModifiedArray')][4]//*[contains(@class, 'rightObj')]"));


        clickElement(By.id("qb_cde_empty"));
        textPresent("Quick Board (0)");
    }

    @Test
    public void expandAllQuickBoard() {
        goToCdeSearch();
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.xpath("//*[@id=\"qb_cde_tab\"]/a"));
        clickElement(By.id("qb.cde.openCloseAll"));
        textPresent("AJCC Based:");
        textPresent("Value used as a Standard Deviation");

        clickElement(By.id("qb_cde_empty"));
        textPresent("Quick Board (0)");
    }

    @Test
    public void testQuickBoardButtons() {
        goToCdeSearch();
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        textPresent("Quick Board (2)");
        clickElement(By.linkText("Quick Board (2)"));
        clickElement(By.id("qb_cde_compare_0"));
        clickElement(By.id("qb_cde_compare_1"));
        clickElement(By.id("qb.cde.compare"));
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
        clickElement(By.id("qb.cde.compare"));
        textPresent("Prostate Cancer pN0 TNM Finding");
        textPresent("Prostate Tumor Pathologic N Stage");
        textPresent("NCI Thesaurus");
    }

    public void emptyQuickBoard(String module) {
        if (findElement(By.id("menu_qb_link")).getText().contains("( empty )")) return;
        clickElement(By.partialLinkText("Quick Board ("));
        String tabXPath = "//*[@id=\"qb." + module + ".tab\"]/a";
        clickElement(By.xpath(tabXPath));
        String emptyBtn = "qb." + module + ".empty";
        clickElement(By.id(emptyBtn));
        clickElement(By.linkText("Quick Board (0)"));
        hangon(1);
    }

    @Test
    public void gotoEmptyQuickBoard() {
        goHome();
        textPresent("Quick Board (0)");
        hangon(0.5);
        findElement(By.linkText("Quick Board (0)")).click();
        try {
            textPresent("The quick board is empty.");
        } catch (Exception e) {
            goHome();
            findElement(By.linkText("Quick Board (0)")).click();
            textPresent("The quick board is empty.");
        }
    }

    @Test
    public void emptyQuickBoardTest() {
        goToCdeSearch();
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        addCdeToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        findElement(By.linkText("Quick Board (5)")).click();
        findElement(By.id("qb_cde_empty")).click();
        findElement(By.linkText("Quick Board (0)")).click();
    }

    @Test
    public void showGridView() {
        goToCdeSearch();
        addCdeToQuickBoard("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage");
        addCdeToQuickBoard("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value");
        addCdeToQuickBoard("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addCdeToQuickBoard("Prior BMSCT Administered Indicator");
        addCdeToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        findElement(By.linkText("Quick Board (5)")).click();
        textPresent("Generalized Activities of Daily Living Pain Restricted Scale");
        hangon(1);
        waitAndClick(By.id("cde_gridView"));
        textPresent("3436564");
        textPresent("pN0");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("2320242");
        findElement(By.id("qb_cde_empty")).click();
        textPresent("Quick Board (0)");
    }

    @Test
    public void removeOne() {
        goToCdeSearch();
        findElement(By.id("browseOrg-OHSU Knight")).click();
        textPresent("4 results for");
        clickElement(By.id("addToCompare_0"));
        findElement(By.id("addToCompare_1")).click();
        findElement(By.id("addToCompare_2")).click();
        String toRemove = findElement(By.id("acc_link_2")).getText();
        findElement(By.id("addToCompare_3")).click();
        hangon(.5);
        findElement(By.linkText("Quick Board (4)")).click();
        hangon(.5);
        textPresent(toRemove);
        List<WebElement> pluses = driver.findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        findElement(By.id("remove_2")).click();
        hangon(.5);
        pluses = driver.findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        textNotPresent(toRemove);
    }

}
