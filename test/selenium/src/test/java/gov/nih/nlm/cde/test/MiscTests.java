package gov.nih.nlm.cde.test;


import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import static com.jayway.restassured.RestAssured.*;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class MiscTests extends NlmCdeBaseTest {

    protected static String baseUrl = System.getProperty("testUrl");

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
        Assert.assertEquals( "You must be logged in to do that", response );

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
        Assert.assertEquals( "You must be logged in to do that", response );

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl+"/user/me?ticket=invalid").asString();
        Assert.assertEquals( "You must be logged in to do that", response );
    }

    @Test
    public void checkConnectionTimeout() {
        
        // Make sure ticket validation times out
        String response = get(baseUrl+"/user/me?ticket=timeout4").asString();
        //System.out.println(response);
        Assert.assertEquals( "You must be logged in to do that", response );
        
        // Make sure ticket validation doesn't times out
        response = get(baseUrl+"/user/me?ticket=timeout1").asString();
        get(baseUrl+"/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue( response.contains("_id") );
        Assert.assertTrue( response.contains("ninds") );
    }

    
}
