package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagementTest extends BoardTest {
    
    @Test
    public void boardPublisher() {
        mustBeLoggedInAs("boardPublisherTest", password);
        createBoard("IsItPublic", "A board that we try to make public");
        makePublic("IsItPublic", "You don't have permission to make boards public!");        
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Users")).click();
        
        findElement(By.name("searchUsers")).sendKeys("boardPublisherTest");
        findElement(By.id("searchUsersSubmit")).click();
        findElement(By.xpath("//div[@id='user_roles_0']//input")).sendKeys("boardp");
        findElement(By.xpath("//div[@id='user_roles_0']//li/div/span")).click();
        textPresent("Roles saved");
        closeAlert();
        
        mustBeLoggedInAs("boardPublisherTest", password);
        gotoMyBoards();
        makePublic("IsItPublic");
    }
    

    @Test
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String cdeName = "Specimen Array";

        goToCdeSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        Assert.assertTrue(textPresent("Create a board now"));
        findElement(By.id("cancelSelect")).click();
        modalGone();
    }
    

       
}
