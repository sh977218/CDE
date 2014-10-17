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
    
}
