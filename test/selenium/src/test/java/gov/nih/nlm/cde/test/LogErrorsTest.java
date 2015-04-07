package gov.nih.nlm.cde.test;

import static com.jayway.restassured.RestAssured.*;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogErrorsTest extends NlmCdeBaseTest {
    @Test
    public void logServerErrors() {        
        String response = get(baseUrl+"/triggerServerErrorExpress").asString();
        Assert.assertEquals( "received", response );
        response = get(baseUrl+"/triggerServerErrorMongoose").asString();
        Assert.assertEquals( "received", response );

        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        
        findElement(By.linkText("Server Errors")).click();        
        
        textPresent("ReferenceError: trigger is not defined");
        textPresent("/triggerServerErrorExpress");
        textPresent("app.express.error");
        textPresent("app.domain.error");
    }  
    
    @Test
    public void logClientErrors() {        
        driver.get(baseUrl + "#/triggerClientException");
        textPresent("An exception in your browser has been triggered");
        hangon(1);

        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Audit")).click();
        
        findElement(By.linkText("Client Errors")).click();       
        
        textPresent("ReferenceError: trigger is not defined at");
        textPresent("trigger is not defined");
    }    
}
