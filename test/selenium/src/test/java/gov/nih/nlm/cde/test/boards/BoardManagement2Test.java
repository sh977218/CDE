package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagement2Test  extends BoardTest {

    @Test
    public void cdeBoards() {
        hangon(.5);
        mustBeLoggedInAs(boarduser1_username, password);
        String board1 = "First CDE Board";
        String board2 = "Second CDE Board";
        
        createBoard(board1, "");
        createBoard(board2, "");
        
        makePublic(board1);
        
        pinTo("Biomarker Outcome", board1);
        pinTo("Biomarker Outcome", board2);
        
        goToCdeByName("Biomarker Outcome");
        findElement(By.xpath("//li[@heading='Boards']/a")).click();
        
        textPresent(board1);
        textNotPresent(board2);

        makePublic(board2);

        hangon(2);
        goToCdeByName("Biomarker Outcome");
        findElement(By.xpath("//li[@heading='Boards']/a")).click();
        
        textPresent(board1);
        textPresent(board2);
        
        removeBoard(board1);
        removeBoard(board2);
    }  
    
    @Test
    public void pagination() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        findElement(By.linkText("10")).click();
    }     
    
    @Test
    public void tooManyBoards() {
        mustBeLoggedInAs("boardBot", password);
        gotoMyBoards();
        createBoard("BoardBots successfull board", "This board should be created!");
        createBoard("Failboard!", "This board will disappear!", "You have too many boards!");
    }      
}
