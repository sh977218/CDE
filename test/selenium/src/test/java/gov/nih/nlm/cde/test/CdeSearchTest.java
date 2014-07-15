package gov.nih.nlm.cde.test;

import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class CdeSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void cdeFullDetail() {
        goToCdeByName("Genotype Therapy Basis Mutation");
        Assert.assertTrue(textPresent("Genotype Therapy Basis Mutation Analysis Indicator"));
        Assert.assertTrue(textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing"));
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Unknown"));
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("Mutation Analysis"));
        Assert.assertTrue(textPresent("C18302"));
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("This Data Element has no history"));
        findElement(By.linkText("Classification")).click();
        WebElement csDl = findElement(By.id("repeatCs"));
        List<WebElement> csElements = csDl.findElements(By.cssSelector("#repeatCs ul li"));
        Assert.assertEquals(csElements.size(), 7);
        List<String> assertList = new ArrayList<String>();
        assertList.add("> GO Trial");
        assertList.add("> GO New CDEs");
        assertList.add("> C3D");
        assertList.add("> caBIG");
         

        List<String> actualList = new ArrayList<String>();
        for (WebElement csElt : csElements) {
            actualList.add(csElt.getText());
        }
        for (String a : assertList) {
            Assert.assertTrue(actualList.contains(a));
        }
        
        findElement(By.linkText("Identifiers")).click();
        Assert.assertTrue(textPresent("3157849"));
        Assert.assertEquals("1", findElement(By.id("dd_version_nlm")).getText());                
        
    } 
    
    @Test
    public void vdInstruction() {
        goToCdeByName("Participant Identifier Source");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals("One of \"GUID\" or \"Source Registry Specific Identifier\"", findElement(By.id("dd_vd_def")).getText());
    }
    
    
    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        Assert.assertTrue(textPresent("mg/dL"));
    }

    @Test
    public void basicPagination() {
        goToSearch();
        WebElement pagElt = findElement(By.cssSelector("ul.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 12);                
    }
    
    @Test
    public void viewIncrement() {
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        // wait for text to be here.
        Assert.assertTrue(textPresent("Someone who gives blood"));
        // do it twice to get at least one view
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        Assert.assertTrue(textPresent("Someone who gives blood"));
        int nbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        Assert.assertTrue(textPresent("Someone who gives blood"));
        int newNbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        Assert.assertEquals(newNbOfViews, nbOfViews + 1);
    }
        
    @Test
    public void relatedConcepts() {
        goToCdeByName("Patient Visual Change Chief Complaint Indicator");
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Change")).click();
        hangon(2);
        Assert.assertTrue(textPresent("Specimen Inflammation Change Type"));
    }
    
    @Test 
    public void phraseSearch() {
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("Biomarker Gene");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("Biomarker Gene"));
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);

        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys("\"Biomarker Gene\"");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("caBIG (1)"));
        
        Assert.assertTrue(textPresent("Biomarker Gene"));
        Assert.assertTrue(textPresent("1 results for"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 1);
    }
    
    @Test
    public void starSearch() {
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("ISO2109");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("No results were found."));
        
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("ISO2109*");
        findElement(By.id("search.submit")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);
        Assert.assertTrue(textPresent("ISO21090.ST"));
  
    }

    @DataProvider(name = "moreLikeThisDP")
    public Object[][] getMoreLikeThisData() {
        return new Object[][] {
            { "Patient Gender Category", new String[] {"Person Gender Text Type", "Patient Gender Code"} },
            { "Ethnic Group Category Text", new String[] {"Participant Ethnic Group Category", "Patient Ethnic Group Category"} },
        };
    }
    
    @Test(dataProvider = "moreLikeThisDP")
    public void moreLikeThis(String cdeSource, String[] cdeTargets){
        goToCdeByName(cdeSource);
        findElement(By.linkText("More Like This")).click();
        for (String tCde : cdeTargets) {
            Assert.assertTrue(textPresent(tCde));
        }
    }
    
    @Test
    public void openAllButton() {
        goToSearch();
        for (int i = 0; i < 19; i++) {
            wait.until(ExpectedConditions.elementToBeClickable(By.id("acc_link_" + i)));
        }
        findElement(By.id("openAllCb")).click();
        for (int i = 0; i < 19; i++) {
            wait.until(ExpectedConditions.elementToBeClickable(By.id("acc_link_" + i)));
        }
    }
    
    @Test
    public void usedBySummary() {
        goToSearch();
        openCdeInList("Patient Race Category");
        String usedBy = findElement(By.id("dd_usedBy")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));
    }
    
    private void matchedByNotVisibleIfPrimaryName() {
        List<WebElement> linkList = driver.findElements(By.xpath("//span[text()='Classification']"));
        Assert.assertEquals(linkList.size(), 0);  
    }
    
    @Test 
    public void searchHighlight() {
        goToSearch();
        findElement(By.name("ftsearch")).sendKeys("patient");
        findElement(By.id("search.submit")).click();    
        hangon(0.5);
        matchedByNotVisibleIfPrimaryName();
        findElement(By.linkText("3")).click();
        hangon(0.5);
        Assert.assertEquals(driver.findElements(By.xpath("//span[text()=\"Definition\"]")).size(), 9);
        Assert.assertEquals(driver.findElements(By.xpath("//span[text()=\"Permissible Values\"]")).size(), 3);
        Assert.assertEquals(driver.findElements(By.xpath("//span[text()=\"Classification\"]")).size(), 8);
    }
}
