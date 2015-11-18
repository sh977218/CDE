package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class QuickBoardTest extends NlmCdeBaseTest {

    public void emptyQuickBoard() {
        if (findElement(By.id("menu_qb_link")).getText().contains("( empty )")) return;
        findElement(By.partialLinkText("Quick Board (")).click();
        findElement(By.id("qb.empty")).click();
        findElement(By.linkText("Quick Board (0)")).click();
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
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard( "Prior BMSCT Administered Indicator" );
        addToQuickBoard( "Generalized Activities of Daily Living Pain Restricted Scale" );
        textPresent("Quick Board (5)");
        findElement(By.linkText("Quick Board (5)")).click();
        findElement(By.id("qb.empty")).click();
        findElement(By.linkText("Quick Board (0)")).click();
    }
    
    @Test
    public void showGridView() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard("Prior BMSCT Administered Indicator");
        addToQuickBoard("Generalized Activities of Daily Living Pain Restricted Scale");
        textPresent("Quick Board (5)");
        findElement(By.linkText("Quick Board (5)")).click();
        textPresent("Generalized Activities of Daily Living Pain Restricted Scale");
        hangon(1);
        waitAndClick(By.id("gridView"));
        textPresent("3436564");
        textPresent("pN0");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("2320242");
        findElement(By.id("qb.empty")).click();
        textPresent( "Quick Board (0)" );
    }

    @Test
    public void noSideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count");
        addToQuickBoard("Prior BMSCT Administered Indicator");
        textPresent("Quick Board (3)");
        findElement(By.linkText("Quick Board (3)")).click();
        findElement(By.id("qb.compare")).click();
        textPresent("You may only compare 2 CDEs side by side." );
        findElement(By.id("qb.empty")).click();
        textPresent( "Quick Board (0)" );
    }

    @Test
    public void sideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        textPresent("Quick Board (2)");
        findElement(By.linkText("Quick Board (2)")).click();
        hangon(1);
        findElement(By.id("qb.compare")).click();
        textPresent( "View Full Detail" );
        textPresent( "Value used as a Standard Deviation in ALK" );
        textPresent( "Number of months from frontline platinum-based treatment" );
        textPresent( "ALK Standard Deviation" );
        textPresent( "Platinum free interval" );
        textPresent( "Permissible Values" );

        findElement(By.linkText("Quick Board (2)")).click();
        findElement(By.id("qb.empty")).click();
        textPresent( "Quick Board (0)" );
    }
    
    @Test
    public void removeOne() {
        goToCdeSearch();
        findElement(By.id("browseOrg-OHSU Knight")).click();
        textPresent("4 results for");
        findElement(By.id("addToCompare_0")).click();
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
