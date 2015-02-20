package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagement3Test extends BoardTest {

    @Test
    public void editBoard() {
        mustBeLoggedInAs(boarduserEdit_username, password);
        createBoard("Edit Board", "Test");
        gotoMyBoards();
        String modified = findElement(By.id("dd_mod")).getText();
        findElement(By.id("name_edit_0")).click();
        findElement(By.id("name_input_0")).sendKeys(" -- Name Edited");
        findElement(By.id("name_confirm_0")).click();

        textPresent("Saved");
        closeAlert();
        textPresent("Edit Board -- Name Edited");
        
        hangon(1);
        
        findElement(By.id("desc_edit_0")).click();
        findElement(By.id("desc_input_0")).sendKeys(" -- Desc Edited");
        findElement(By.id("desc_confirm_0")).click();
        
        goToCdeSearch();
        gotoMyBoards();
        textPresent("-- Name Edited");
        textPresent("-- Desc Edited");
        
        Assert.assertNotEquals(modified + " --- " + findElement(By.id("dd_mod")).getText(), modified, findElement(By.id("dd_mod")).getText());
        
        removeBoard("Edit Board -- Name Edited");
    }
    
    @Test
    public void searchBoard() {
        mustBeLoggedInAs(boardSearchUser_username, password);
        String pubBlood = "Public Blood Board";
        String privBlood = "Private Blood Board";
        String pubSmoking = "Public Smoking Board";

        createBoard(pubBlood, "");
        createBoard(privBlood, "");
        createBoard(pubSmoking, "");
        
        makePublic(pubBlood);
        makePublic(pubSmoking);

        modalGone();
        gotoPublicBoards();
        
        findElement(By.name("search")).sendKeys("Blood");
        findElement(By.id("search.submit")).click();
        
        Assert.assertTrue(textPresent(pubBlood));

        Assert.assertTrue(textNotPresent("Smoking"));
        Assert.assertTrue(textNotPresent("Private"));
        
        removeBoard(pubBlood);
        removeBoard(privBlood);
        removeBoard(pubSmoking);
        
    }
    
}
