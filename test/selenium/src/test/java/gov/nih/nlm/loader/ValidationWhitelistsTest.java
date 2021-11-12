package gov.nih.nlm.loader;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class ValidationWhitelistsTest extends NlmCdeBaseTest {

    @Test
    public void addRemoveWhitelist(){
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        clickElement(By.id("openNewWhitelistModalBtn"));
        findElement(By.id("newWhitelistname")).sendKeys("new_whitelist");
        findElement(By.id("newWhitelistterms")).sendKeys("hello|world");
        clickElement(By.id("createNewWhitelistBtn"));

        hangon(2);

        nonNativeSelect("", "Whitelist", "new_whitelist");

        clickElement(By.id("openEditWhitelistModalBtn"));

        textPresent("hello");
        findElement(By.id("removeWhiteListTerm-hello"));
        textPresent("world");
        findElement(By.id("removeWhiteListTerm-world"));

        clickElement(By.id("cancelEditWhitelistBtn"));

        hangon(2);

        clickElement(By.id("openDeleteWhitelistModalBtn"));

        clickElement(By.id("deleteWhitelistBtn"));
        hangon(2);

        String xPath = "//mat-select[following-sibling::*[contains(@class,'mat-form-field-label-wrapper')]/label[contains(.,'Whitelist')]]";
        clickElement(By.xpath(xPath));

        textNotPresent("new_whitelist");
        textPresent("test_whitelist");
    }

    @Test
    public void copyWhitelist(){
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        clickElement(By.id("openNewWhitelistModalBtn"));
        findElement(By.id("newWhitelistname")).sendKeys("copy_test");
        findElement(By.id("newWhitelistterms")).sendKeys("copy|terms");
        clickElement(By.id("createNewWhitelistBtn"));

        hangon(2);

        nonNativeSelect("", "Whitelist", "copy_test");

        clickElement(By.id("copyWhitelistBtn"));

        clickElement(By.id("createNewWhitelistBtn"));

        hangon(2);

        nonNativeSelect("", "Whitelist", "Copy of copy_test");

        clickElement(By.id("openEditWhitelistModalBtn"));

        textPresent("copy");
        findElement(By.id("removeWhiteListTerm-copy"));
        textPresent("terms");
        findElement(By.id("removeWhiteListTerm-terms"));

        clickElement(By.id("cancelEditWhitelistBtn"));
    }

    @Test
    public void addRemoveWhitelistTerms(){
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        nonNativeSelect("", "Whitelist", "empty_whitelist");

        clickElement(By.id("openEditWhitelistModalBtn"));
        findElement(By.id("addNewWhitelistTerm")).sendKeys("new_term");
        clickElement(By.id("addNewWhitelistTermBtn"));
        clickElement(By.id("editWhitelistBtn"));

        hangon(2);

        clickElement(By.id("openEditWhitelistModalBtn"));
        textPresent("new_term");
        clickElement(By.id("removeWhiteListTerm-new_term"));
        clickElement(By.id("editWhitelistBtn"));

        hangon(2);

        clickElement(By.id("openEditWhitelistModalBtn"));
        textNotPresent("new_term");
    }

    @Test
    public void whitelistBadRequests(){
        mustBeLoggedInAs(theOrgAuth_username, password);

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/addNewWhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No name for new whitelist provided"));

        resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No whitelist specified"));

        resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .body("{\"whitelistName\" : \"this_whitelist_is_not_real\"}")
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("Whitelist not valid"));
    }
}
