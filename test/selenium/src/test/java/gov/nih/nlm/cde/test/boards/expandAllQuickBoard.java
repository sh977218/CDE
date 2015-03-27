package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ExpandAllQuickBoard extends NlmCdeBaseTest {

    @Test
    public void expandAllQuickBoard() {
        goToCdeSearch();
        addToQuickBoard( "Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage" );
        addToQuickBoard( "Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value" );

        Assert.assertTrue(textPresent("Quick Board ( 2 )"));

        findElement(By.linkText("Quick Board ( 2 )")).click();

        findElement(By.id("qb.openCloseAll")).click();
        Assert.assertTrue(textPresent("AJCC Based:"));
        Assert.assertTrue(textPresent("Value used as a Standard Deviation"));

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
        textNotPresent("Loading...");

        Assert.assertFalse(findElement(By.id("qb.accordion")).isEnabled());
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
