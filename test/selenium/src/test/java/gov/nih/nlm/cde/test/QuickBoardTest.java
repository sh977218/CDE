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
        } else {
            findElement(By.id("emptyCart")).click();
            Assert.assertTrue(textPresent("The quick board is empty."));
        }
    }

    @Test
    public void testFullQuickBoard() {
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
    }

    @Test
    public void testFull() {
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
    }
}
