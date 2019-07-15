package gov.nih.nlm.board.cde;

import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class PinCdesIntoBoardTest extends BoardTest {

    @Test
    public void pinCdesIntoBoard() {
        String boardName1 = "Smoking Board";
        String boardName2 = "Blood Board";
        String cdeName = "School special accommodation indicator";
        mustBeLoggedInAs(pinUser, password);
        goToBoard(boardName1);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 2);
        textPresent("Smoking History");
        textPresent("Form Element End Date");

        goToBoard(boardName2);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.singleSearchResult")).size(), 2);
        textPresent("Laboratory Procedure Blood Urea Nitrogen");
        textPresent("Umbilical Cord Blood");

        goToCdeByName(cdeName);
        clickElement(By.id("addToBoard"));
        textPresent("Choose a Board to pin this CDE to");
        clickBoardHeaderByName(boardName2);
        checkAlert("Added to Board");

        goToBoard(boardName2);
        textPresent("School special accommodation indicator");
    }

    @Test
    public void pinNoPerm() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .put(baseUrl + "/server/board/pinToBoard").then().statusCode(404);
    }

}
