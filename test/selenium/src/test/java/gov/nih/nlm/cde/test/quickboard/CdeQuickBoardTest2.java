package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeQuickBoardTest2 extends NlmCdeBaseTest {

    @Test
    public void showGridViewInCdeQuickBoard() {
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
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        textPresent("Generalized Activities of Daily Living Pain Restricted Scale");
        hangon(1);
        clickElement(By.id("list_gridView"));
        textPresent("3436564");
        textPresent("pN0");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("2320242");
        clickElement(By.id("qb_cde_empty"));
        textPresent("CDE QuickBoard (0)");
    }

    @Test
    public void removeOneFromCdeQuickBoard() {
        goToCdeSearch();
        clickElement(By.xpath("//*[@id='browseOrg-OHSU Knight']"));
        textPresent("4 results for");
        clickElement(By.id("addToCompare_0")); //right here
        closeAlert();
        clickElement(By.id("addToCompare_1"));
        closeAlert();
        clickElement(By.id("addToCompare_2"));
        closeAlert();
        String toRemove = findElement(By.id("linkToElt_2")).getText();
        clickElement(By.id("addToCompare_3"));
        closeAlert();
        hangon(.5);
        goToQuickBoardByModule("cde");
        hangon(.5);
        textPresent(toRemove);
        List<WebElement> pluses = driver.findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        clickElement(By.id("remove_2"));
        hangon(.5);
        pluses = driver.findElements(By.cssSelector("i.fa-plus"));
        for (WebElement plus : pluses) {
            Assert.assertFalse(plus.isDisplayed());
        }
        textNotPresent(toRemove);
    }

    @Test
    public void goToEmptyQuickBoard() {
        goHome();
        textPresent("Quick Board (0)");
        clickElement(By.xpath("//*[@id='menu_qb_link']/a"));
        textPresent("CDE QuickBoard (0)");
        textPresent("Form QuickBoard (0)");
        textPresent("The quick board is empty.");
    }

}
