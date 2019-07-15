package gov.nih.nlm.board.cde;

import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class PinAllLessThan20 extends BoardTest {

    @Test
    public void pinAllLessThan20() {
        String boardName = "Pin All Less Than 20 Test Board";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToCdeSearch();

        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Stroke"));
        clickElement(By.id("classif-Classification"));
        clickElement(By.id("classif-Exploratory"));
        textPresent("9 results for All Terms");
        int searchResultNum_int = getNumberOfResults();
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        clickBoardHeaderByName(boardName);
        checkAlert("All elements pinned.");
        waitForESUpdate();
        gotoMyBoards();

        // find nb of cdes for the boards.
        int num_cde_after_pinAll_int = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
    }

    @Test
    public void unpinPerm() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).body("{boardId: '575046ad89949d54384ee60a'}")
                .post(baseUrl + "/server/board/pinEntireSearchToBoard").then().statusCode(404);
    }


}
