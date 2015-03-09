package gov.nih.nlm.cde.test;


import com.jayway.restassured.RestAssured;
import static com.jayway.restassured.RestAssured.*;
import com.jayway.restassured.http.ContentType;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MiscTests extends NlmCdeBaseTest {

    @Test
    public void testSearchBox() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("All Classifications"));
        Assert.assertTrue(textPresent("NINDS"));
        Assert.assertTrue(textPresent("CTEP"));
        findElement(By.linkText("CTEP")).click();

        findElement(By.id("searchTerms")).click();
        findElement(By.id("quickSearchButton"));
        findElement(By.id("quickSearchReset"));
    }
    
    @Test
    public void testReset() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("AECC"));
        findElement(By.linkText("AECC")).click();
        findElement(By.id("searchTerms")).sendKeys("Race Category");
        Assert.assertEquals( findElement(By.id("searchTerms")).getAttribute("value"), "Race Category" );
        findElement(By.id("quickSearchReset")).click();
        Assert.assertTrue( textPresent("All Classifications") );
        Assert.assertEquals( findElement(By.id("searchTerms")).getAttribute("value"), "" );
    }
    
    @Test
    public void testSearch() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("CCR"));
        findElement(By.linkText("CCR")).click();
        findElement(By.id("searchTerms")).sendKeys("Person Birth");
        findElement(By.id("quickSearchButton")).click();
        findElement(By.name("ftsearch"));
        showSearchFilters();
        Assert.assertTrue(textPresent("Qualified ("));
        Assert.assertTrue( textPresent("Person Other Premalignant Non-Melanomatous Lesion Indicator") );
    }

    
    @Test
    public void gridView() {
        goToCdeSearch();
        findElement(By.id("li-blank-AECC")).click();
        hangon(2);
        findElement(By.id("gridView")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("exportLink")));
        List<WebElement> rows = driver.findElements(By.xpath("//div[@class='ngCanvas']/div"));
        Assert.assertEquals(7, rows.size());
        Assert.assertTrue(textPresent("Noncompliant Reason"));
        Assert.assertTrue(textPresent("Race Category Text"));
        Assert.assertTrue(textPresent("Prostate Cancer American"));
    }
    
    
    @Test
    public void checkTicketValid() {
        
        // Test to make sure user isn't logged in
        String response = get(baseUrl+"/user/me").asString();
        Assert.assertEquals( "Not logged in.", response );

        // Provide fake ticket and make sure user info is retrieved
        response = get(baseUrl+"/user/me?ticket=valid").asString();
        //System.out.println(response);
        get(baseUrl+"/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue( response.contains("_id") );
        Assert.assertTrue( response.contains("ninds") );
    }

    @Test
    public void checkTicketInvalid() {
        
        // Test to make sure user isn't logged in
        String response = get(baseUrl+"/user/me").asString();
        Assert.assertEquals( "Not logged in.", response );

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl+"/user/me?ticket=invalid").asString();
        Assert.assertEquals( "Not logged in.", response );
    }

    @Test
    public void checkConnectionTimeout() {
        
        // Make sure ticket validation times out
        String response = get(baseUrl+"/user/me?ticket=timeout4").asString();
        //System.out.println(response);
        Assert.assertEquals( "Not logged in.", response );
        
        // Make sure ticket validation doesn't times out
        response = get(baseUrl+"/user/me?ticket=timeout1").asString();
        get(baseUrl+"/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue( response.contains("_id") );
        Assert.assertTrue( response.contains("ninds") );
    }

    
    @Test
    public void leavePageWarning() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Intra-arterial Catheter Patient Not Administered Reason");
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        
        findElement(By.linkText("CDEs")).click();
        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.dismiss();
        
        findElement(By.linkText("CDEs")).click();
        shortWait.until(ExpectedConditions.alertIsPresent());
        alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.accept();
        findElement(By.id("showHideFilters"));
    }
    
    @Test
    public void deViewTour() {
        mustBeLoggedOut();
        goToCdeByName("Person Birth Date");
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent("an overview of the CDE attributes");
        getNext("to see what type of value are allowed");
        getNext("may have multiple names, often given");
        getNext("describe the way in which an organization may use a CDE");
        getNext("are sometimes described by one or more concepts");
        getNext("show attributes of the CDE that");
        getNext("may be identified multiple times across CDE users");
        getNext("If a the CDE is used in a Form, it will ");
        getNext("This section supports mapping of a CDE to external resources such as C-CDA document templates.");
        getNext("registered users are able to post");
        getNext("is used in a public board, the");
        getNext("If a file is attached to a CDE, it can");
        getNext("This section lists CDEs that are most similar");
        getNext("shows all prior states of the CDE");
        getNext("would like to propose a change to an existing CDE, he may create a fork");
        findElement(By.xpath("//button[@data-role='end']")).click();
    }    
    
    private void getNext(String expectedText) {
        findElement(By.xpath("//button[@data-role='next']")).click();
        textPresent(expectedText);
    }
    
    @Test
    public void listTour() {
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent("Welcome to the NIH");
        getNext("back to the CDE search page");
        getNext("take you to the Form search page");
        getNext("Boards allow registered users to group CDEs");
        getNext("The quick board is emptied when the");
        getNext("more documentation about this site or start this tour again");
        getNext("For example, search for");
        getNext("a combination of most relevant and higher status CDEs first");
        getNext(" to view the CDE summary");
        getNext("Click the eye to see the full detail");
        getNext("The plus sign will add a CDE");
        getNext("view shows all search results (max 1000)");
        getNext("If your screen is small and the");
        getNext("tree to filter results by context, domain,");
        getNext("You can add a second classification ");
        getNext("See which filter are applied");
        getNext("Restrict search to one or more ");
        getNext("By default, CDEs in Recorded status");
        findElement(By.xpath("//button[@data-role='end']")).click();
    }    
    
}
