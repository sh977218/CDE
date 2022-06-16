package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;
import org.testng.Assert;

public class CdeBoardsDefaultsTest extends BoardTest {

    @Test
    public void createDefaultCDEBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String cdeName = "Prior BMSCT Administered Indicator";
        String defaultBoardName = "CDE Board 1";
        goToCdeByName(cdeName);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to New Board");

        String cdeName2 = "Biomarker Outcome Characteristics java.lang.String";
        goToCdeByName(cdeName2);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + defaultBoardName);

        goToBoard(defaultBoardName);
        textPresent(cdeName);
        textPresent(cdeName2);

        gotoMyBoards();
        clickElement(By.xpath("//*[@id='" + defaultBoardName + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(defaultBoardName);
    }

    @Test(dependsOnMethods={"createDefaultCDEBoard"})
    public void defaultToMostRecentBoard(){
        String boardName1 = "Test Board 1";
        String boardName2 = "Test Board 2";
        mustBeLoggedInAs(boarduser2_username, password);
        createBoard(boardName1, "Test Order 1", "cde");
        createBoard(boardName2, "Test Order 2", "cde");

        String cdeName1 = "Prior BMSCT Administered Indicator";
        String cdeName2 = "Biomarker Outcome Characteristics java.lang.String";
        String cdeName3 = "Specimen Inflammation Change Type";

        pinCdeToBoard(cdeName1,boardName1);
        hangon(1);

        goToCdeByName(cdeName2);
        clickElement(By.id("addToBoard"));

        hangon(2);

        Assert.assertEquals(
            driver.findElement(
                    By.cssSelector("cde-board-view-template:nth-of-type(1) > *")
            ).getAttribute("id"), boardName1
        );

        clickBoardHeaderByName(boardName2);
        hangon(1);

        goToCdeByName(cdeName3);
        clickElement(By.id("addToBoard"));

        hangon(2);

        Assert.assertEquals(
            driver.findElement(
                    By.cssSelector("cde-board-view-template:nth-of-type(1) > *")
            ).getAttribute("id"), boardName2
        );

        clickBoardHeaderByName(boardName1);
        hangon(1);

        goToCdeByName(cdeName1);
        clickElement(By.id("addToBoard"));

        hangon(2);

        Assert.assertEquals(
            driver.findElement(
                    By.cssSelector("cde-board-view-template:nth-of-type(1) > *")
            ).getAttribute("id"), boardName1
        );

        clickCancelButton();

        gotoMyBoards();

        clickElement(By.xpath("//*[@id='" + boardName1 + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName1);

        clickElement(By.xpath("//*[@id='" + boardName2 + "']//*[contains(@class,'deleteBoard')]"));
        clickElement(By.id("saveDeleteBoardBtn"));
        checkAlert("Deleted.");
        textNotPresent(boardName2);
    }

}


