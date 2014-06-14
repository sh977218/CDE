package gov.nih.nlm.cde.test;

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
        
        if( textPresent( "Quick Board ( empty )" ) ) {
            Assert.assertTrue(textPresent("The quick board is empty."));
        }
    }

    @Test
    public void addtoQuickBoardUntilFull() {
        goToSearch();
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
        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }

    @Test
    public void emptyQuickBoard() {
        goToSearch();
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
        goToSearch();
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
        goToSearch();
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
        goToSearch();
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );
        addToQuickBoard( "Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count" );
        Assert.assertTrue(textPresent("Quick Board ( 2 )"));
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.compare")).click();
        hangon(1);
        Assert.assertTrue( textPresent( "Side by Side Compare" ) );
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.empty")).click();
        Assert.assertTrue( textPresent( "Quick Board ( empty )" ) );
    }
    
}
