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

    private void typeWhitelistname(String collectionName) {
        findElement(By.id("newWhitelistname")).sendKeys(collectionName);
    }

    @Test
    public void addRemoveWhitelist() {
        String collectionName = "new_whitelist";
        String[] terms = new String[]{"hello", "world"};

        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        clickElement(By.id("openNewWhitelistModalBtn"));
        typeWhitelistname(collectionName);
        addMatChipByTextArray(terms);
        clickElement(By.id("createNewWhitelistBtn"));
        modalGone();

        clickElement(By.id("openEditWhitelistModalBtn"));
        textPresent("hello");
        textPresent("world");
        clickElement(By.id("cancelEditWhitelistBtn"));
        modalGone();

        clickElement(By.id("openDeleteWhitelistModalBtn"));
        clickElement(By.id("deleteWhitelistBtn"));
        modalGone();
        clickMatSelect();
        textNotPresent("new_whitelist");
        textPresent("test_whitelist");
    }

    @Test
    public void copyWhitelist() {
        String collectionName = "copy_test";
        String collectionNameCopy = "Copy of copy_test";
        String[] terms = new String[]{"copy", "terms"};

        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        clickElement(By.id("openNewWhitelistModalBtn"));
        typeWhitelistname(collectionName);
        addMatChipByTextArray(terms);
        clickElement(By.id("createNewWhitelistBtn"));
        modalGone();

        clickElement(By.id("copyWhitelistBtn"));
        clickElement(By.id("createNewWhitelistBtn"));
        modalGone();

        selectMatSelect("", "Whitelist", collectionNameCopy);
        clickElement(By.id("openEditWhitelistModalBtn"));
        textPresent("copy");
        textPresent("terms");
        clickElement(By.id("cancelEditWhitelistBtn"));
    }

    @Test
    public void editWhitelistTerms() {
        String collectionName = "empty_whitelist";
        String term = "new_term";
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToSpellCheck();

        selectMatSelect("", "Whitelist", collectionName);

        clickElement(By.id("openEditWhitelistModalBtn"));
        addMatChipByText(term);
        clickElement(By.id("editWhitelistBtn"));
        modalGone();

        clickElement(By.id("openEditWhitelistModalBtn"));
        textPresent(term);
        removeMatChipByText(term);
        clickElement(By.id("editWhitelistBtn"));
        modalGone();

        clickElement(By.id("openEditWhitelistModalBtn"));
        textNotPresent(term);
    }

    @Test
    public void whitelistAPI1() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/addNewWhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No name for new whitelist provided"));


    }

    @Test
    public void whitelistAPI2() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();

        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No whitelist specified"));
    }

    @Test
    public void whitelistAPI3() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();

        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .body("{\"collectionName\" : \"this_whitelist_is_not_real\"}")
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("Whitelist not valid"));
    }
}