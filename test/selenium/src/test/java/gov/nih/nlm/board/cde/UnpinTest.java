package gov.nih.nlm.board.cde;

import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class UnpinTest extends BoardTest {

    @Test
    public void unpin() {
        mustBeLoggedInAs(unpinUser, password);
        String cdeName = "Imaging volumetric result";
        goToBoard("Unpin Board");
        textPresent(cdeName);
        clickElement(By.id("unpin_0"));
        goToBoard("Unpin Board");
        textNotPresent(cdeName);
    }

    @Test
    public void unpinPerm() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .post(baseUrl + "/server/board/deletePin").then().statusCode(401);
    }

    @Test
    public void unpinBadIndex() {
        mustBeLoggedInAs(unpinUser, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{boardId: '57114b5328329938330f5c7f', tinyId: 'wrong'}")
                .post(baseUrl + "/server/board/deletePin").then().statusCode(401);
    }


}
