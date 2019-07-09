package gov.nih.nlm.board.cde;

import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class RemoveBoardTest extends BoardTest {
    @Test
    public void removeBoard() {
        String boardName = "Remove me board";
        mustBeLoggedInAs(boardUser, password);
        gotoMyBoards();
        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName);
    }

    @Test
    public void unpinPerm() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).delete(baseUrl + "/server/board/575046ad89949d54384ee60a").then().statusCode(401);
    }

}