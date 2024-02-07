package gov.nih.nlm.pinBoard;

import gov.nih.nlm.board.cde.BoardTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;


// @TODO THOSE codes are migrated to Playwright already, but playwright needs to a way to authenticate user to do the API test
public class RESTfulAPI extends BoardTest {

    @Test
    public void deletePinAPI1() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .post(baseUrl + "/server/board/deletePin").then().statusCode(404);
    }

    @Test
    public void deletePinAPI2() {
        mustBeLoggedInAs(unpinUser, password);
        Cookie myCookie = getCurrentCookie();
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"57114b5328329938330f5c7f\", \"tinyId\": \"wrong\"}")
                .post(baseUrl + "/server/board/deletePin").then().statusCode(422);
    }

    @Test
    public void deletePinAPI3() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).delete(baseUrl + "/server/board/575046ad89949d54384ee60a").then().statusCode(404);
    }

    @Test
    public void pinEntireSearchToBoardAPI() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().contentType(ContentType.JSON).cookie(myCookie).body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .post(baseUrl + "/server/board/pinEntireSearchToBoard").then().statusCode(404);
    }
    @Test
    public void pinToBoardAPI() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().contentType(ContentType.JSON).cookie(myCookie).body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .put(baseUrl + "/server/board/pinToBoard").then().statusCode(404);
    }

    @Test
    public void reorderPinAPI1() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .post(baseUrl + "/server/board/pinMoveUp").then().statusCode(404);

        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .post(baseUrl + "/server/board/pinMoveDown").then().statusCode(404);

        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"575046ad89949d54384ee60a\"}")
                .post(baseUrl + "/server/board/pinMoveTop").then().statusCode(404);
    }
    @Test
    public void reorderPinAPI2() {
        mustBeLoggedInAs(unpinUser, password);
        Cookie myCookie = getCurrentCookie();

        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"57114b5328329938330f5c7f\", \"tinyId\": \"Wrong\"}")
                .post(baseUrl + "/server/board/pinMoveUp").then().statusCode(422);

        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"57114b5328329938330f5c7f\", \"tinyId\": \"Wrong\"}")
                .post(baseUrl + "/server/board/pinMoveDown").then().statusCode(422);

        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"boardId\": \"57114b5328329938330f5c7f\", \"tinyId\": \"Wrong\"}")
                .post(baseUrl + "/server/board/pinMoveTop").then().statusCode(422);
    }


}
