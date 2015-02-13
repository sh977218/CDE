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
        goHome();
        goToCdeByName("Genotype Therapy Basis Mutation");
        textPresent("Genotype Therapy Basis Mutation Analysis Indicator");
        textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing");
        textPresent("Qualified");
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Unknown");
        findElement(By.linkText("Concepts")).click();
        textPresent("Mutation Analysis");
        textPresent("C18302");
        findElement(By.linkText("History")).click();
        textPresent("This Data Element has no history");
        findElement(By.linkText("Classification")).click();
        WebElement csDl = findElement(By.id("repeatCs"));
        List<WebElement> csElements = csDl.findElements(By.cssSelector("#repeatCs ul li"));
        Assert.assertEquals(csElements.size(), 7);
        List<String> assertList = new ArrayList<>();
        assertList.add("GO Trial");
        assertList.add("GO New CDEs");
        assertList.add("C3D");
        assertList.add("caBIG");  

        List<String> actualList = new ArrayList<>();
        for (WebElement csElt : csElements) {
            actualList.add(csElt.getText());
        }
        for (String a : assertList) {
            Assert.assertTrue(actualList.contains(a));
        }
        
        findElement(By.linkText("Identifiers")).click();
        textPresent("3157849");
        Assert.assertEquals("1", findElement(By.id("dd_version_nlm")).getText());                
        
    } 
    
    @Test
    public void vdInstruction() {
        goHome();
        goToCdeByName("Participant Identifier Source", "Recorded");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals("One of \"GUID\" or \"Source Registry Specific Identifier\"", findElement(By.id("dd_vd_def")).getText());
    }
    
    @Test
    public void searchBySteward() {
        goHome();
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("steward:CIP");
        findElement(By.id("search.submit")).click();
        textPresent("1 results for");
        textPresent("Smoking Status");
    }
    
    
    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        Assert.assertTrue(textPresent("mg/dL"));
    }

    @Test
    public void basicPagination() {
        goToCdeSearch();
        WebElement pagElt = findElement(By.cssSelector("ul.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 12);                
    }
    
    @Test
    public void viewIncrement() {
        goHome();
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        // wait for text to be here.
        textPresent("Someone who gives blood");
        // do it twice to get at least one view
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        textPresent("Someone who gives blood");
        int nbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        textPresent("Someone who gives blood");
        int newNbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        Assert.assertEquals(newNbOfViews, nbOfViews + 1);
    }
        
    @Test
    public void relatedConcepts() {
        goToCdeByName("Patient Visual Change Chief Complaint Indicator");
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Change")).click();
        textPresent("Specimen Inflammation Change Type");
        textNotPresent("Patient Visual Change Chief Complaint Indicator", By.cssSelector("accordion"));
    }
    
    @Test 
    public void phraseSearch() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("Biomarker Gene");
        findElement(By.id("search.submit")).click();
        textPresent("Biomarker Gene");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);

        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys("\"Biomarker Gene\"");
        findElement(By.id("search.submit")).click();
        textPresent("caBIG (1)");
        
        textPresent("Biomarker Gene");
        textPresent("1 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 1);
    }
    
    @Test
    public void starSearch() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("ISO2109");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("No results were found."));
        
        goToCdeSearch();
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
            { "Ethnicity USA category", 
                new String[] {"Ethnicity USA maternal category", "Ethnicity USA paternal category"} },
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
        goToCdeSearch();
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
        goToCdeSearch();
        openCdeInList("Patient Race Category");
        String usedBy = findElement(By.id("dd_usedBy")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));
    }
    
    @Test
    public void badESQuery() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("+-aaa");
        findElement(By.cssSelector("i.fa-search")).click();   
        textPresent("There was a problem with your query");
    }
    
    private void matchedByNotVisibleIfPrimaryName() {
        List<WebElement> linkList = driver.findElements(By.xpath("//span[text()='Classification']"));
        Assert.assertEquals(linkList.size(), 0);  
    }
    
}