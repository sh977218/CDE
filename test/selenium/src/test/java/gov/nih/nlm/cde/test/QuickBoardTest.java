package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class QuickBoardTest extends NlmCdeBaseTest {
    @Test
    public void gotoEmptyQuickBoard() {
        goHome();
        findElement(By.linkText("Quick Board ( empty )")).click();
        Assert.assertTrue(textPresent("The quick board is empty."));
    }

    @Test
    public void addtoQuickBoardUntilFull() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard( "Prior BMSCT Administered Indicator" );
        addToQuickBoard( "Generalized Activities of Daily Living Pain Restricted Scale" );
        addToQuickBoard( "Common Toxicity Criteria Adverse Event Platelet Count Grade" );
        addToQuickBoard( "Direct Pulp Cap Caries Removal Carious Dentin Treatment Tooth 30 Pulp Horn Hemorrhage Event Next Decision Type" );
        addToQuickBoard( "Transurethral Resection Invasive Prostate Carcinoma Incidental Prostatic Tissue Involvement Percentage Range" );
        addToQuickBoard( "Laboratory Procedure Magnesium Result Unspecified Lower Limit of Normal Value" );
        addToQuickBoard( "Central Nervous System Preventive Intervention Administered Indicator" );
     
        Assert.assertTrue(textPresent("Quick Board ( full )"));
    
        findElement(By.linkText("Quick Board ( full )")).click();
        Assert.assertTrue(textNotPresent("The quick board is empty."));
        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }

    @Test
    public void emptyQuickBoard() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard( "Prior BMSCT Administered Indicator" );
        addToQuickBoard( "Generalized Activities of Daily Living Pain Restricted Scale" );
        Assert.assertTrue(textPresent("Quick Board ( 5 )"));
        findElement(By.linkText("Quick Board ( 5 )")).click();
        findElement(By.id("qb.empty")).click();
        findElement(By.linkText("Quick Board ( empty )")).click();
    }
    
    @Test
    public void showGridView() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard( "Prior BMSCT Administered Indicator" );
        addToQuickBoard( "Generalized Activities of Daily Living Pain Restricted Scale" );
        Assert.assertTrue(textPresent("Quick Board ( 5 )"));
        findElement(By.linkText("Quick Board ( 5 )")).click();
        findElement(By.id("qb.gridview"));
        findElement(By.id("qb.compare"));
        findElement(By.id("qb.openCloseAll"));
        Assert.assertNotEquals(driver.findElements(By.cssSelector("div.ngRow")).size(), 5);
        findElement(By.id("qb.gridview")).click();
        Assert.assertEquals(driver.findElements(By.cssSelector("div.ngRow")).size(), 5);
        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }

    @Test
    public void noSideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        addToQuickBoard( "Prior BMSCT Administered Indicator" );
        Assert.assertTrue(textPresent("Quick Board ( 3 )"));
        findElement(By.linkText("Quick Board ( 3 )")).click();
        findElement(By.id("qb.compare")).click();
        Assert.assertTrue( textPresent( "You may only compare 2 CDEs side by side." ) );
        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }

    @Test
    public void sideBySideCompare() {
        goToCdeSearch();
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        textPresent("Quick Board ( 2 )");
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.compare")).click();
        textPresent( "View Full Detail" );
        textPresent( "Value used as a Standard Deviation in ALK" );
        textPresent( "Number of months from frontline platinum-based treatment" );
        textPresent( "ALK Standard Deviation" );
        textPresent( "Platinum free interval" );
        textPresent( "Permissible Values" );
        
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.empty")).click();
        textPresent( "Quick Board ( empty )" );
    }
    
    @Test
    public void removeOne() {
        goToCdeSearch();
        findElement(By.id("li-blank-OHSU Knight")).click();
        Assert.assertTrue(textPresent("4 results for"));
        findElement(By.id("addToCompare_0")).click();
        findElement(By.id("addToCompare_1")).click();
        findElement(By.id("addToCompare_2")).click();
        String toRemove = findElement(By.id("acc_link_2")).getText();
        findElement(By.id("addToCompare_3")).click();
        hangon(.5);
        findElement(By.linkText("Quick Board ( 4 )")).click();
        hangon(.5);
        Assert.assertTrue(textPresent(toRemove));
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
        Assert.assertTrue(textNotPresent(toRemove));
    }
    
    @Test
    public void expandAllQuickBoard() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        
        Assert.assertTrue(textPresent("Quick Board ( 2 )"));
    
        findElement(By.linkText("Quick Board ( 2 )")).click();
        
        findElement(By.id("qb.openCloseAll")).click();
        Assert.assertTrue(textPresent("caBIG AECC LCC USC/NCCC"));
        Assert.assertTrue(textPresent("SPOREs CCR"));

        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }
    
    @Test
    public void testQuickBoardButtons() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        
        textPresent("Quick Board ( 2 )");
    
        findElement(By.linkText("Quick Board ( 2 )")).click();
        
        Assert.assertFalse( findElement(By.id("qb.accordion")).isEnabled() );
        Assert.assertTrue( findElement(By.id("qb.gridview")).isEnabled() );
        Assert.assertTrue( findElement(By.id("qb.compare")).isEnabled() );
        
        findElement(By.id("qb.gridview")).click();
        Assert.assertTrue( findElement(By.id("qb.accordion")).isEnabled() );
        Assert.assertFalse( findElement(By.id("qb.gridview")).isEnabled() );
        Assert.assertTrue( findElement(By.id("qb.compare")).isEnabled() );
        
        findElement(By.id("qb.compare")).click();
        Assert.assertTrue( findElement(By.id("qb.accordion")).isEnabled() );
        Assert.assertTrue( findElement(By.id("qb.gridview")).isEnabled() );
        Assert.assertFalse( findElement(By.id("qb.compare")).isEnabled() );
    }
}
