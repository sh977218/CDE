package gov.nih.nlm.board.cde;

import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class PinReorderingTest extends BoardTest {

    @Test
    public void reorderPins() {
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        clickElement(By.id("moveDown-0"));
        closeAlert();
        textPresent("Ethnicity USA maternal category", By.id("linkToElt_0"));
        clickElement(By.id("moveUp-1"));
        closeAlert();
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        driver.navigate().refresh();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        clickElement(By.id("moveTop-2"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_0"));
        clickElement(By.id("moveDown-0"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_1"));
        clickElement(By.id("moveDown-1"));
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));

        textPresent("Walking ability status", By.id("linkToElt_19"));
        clickElement(By.id("moveDown-19"));
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
        clickElement(By.cssSelector(".mat-paginator-navigation-next"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        clickElement(By.id("moveTop-0"));
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_0"));
        clickElement(By.id("moveUp-0"));
        checkAlert("Saved");
        textPresent("Brief Pain Inventory (BPI) - pain general activity interference scale", By.id("linkToElt_0"));

        clickElement(By.cssSelector(".mat-paginator-navigation-previous"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
    }

    @Test
    public void reorderPerm() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .post(baseUrl + "/server/board/pinMoveUp").then().statusCode(404);

        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .post(baseUrl + "/server/board/pinMoveDown").then().statusCode(404);

        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .post(baseUrl + "/server/board/pinMoveTop").then().statusCode(404);
    }

    @Test
    public void reorderWrongId() {
        mustBeLoggedInAs(unpinUser, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{'boardId': '57114b5328329938330f5c7f', tinyId: 'Wrong'}")
                .post(baseUrl + "/server/board/pinMoveUp").then().statusCode(422);

        given().cookie(myCookie).body("{'boardId': '57114b5328329938330f5c7f', tinyId: 'Wrong'}")
                .post(baseUrl + "/server/board/pinMoveDown").then().statusCode(422);

        given().cookie(myCookie).body("{'boardId': '57114b5328329938330f5c7f', tinyId: 'Wrong'}")
                .post(baseUrl + "/server/board/pinMoveTop").then().statusCode(422);
    }


}


