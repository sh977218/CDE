package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublicBoardsTest extends BoardTest {

    @Test
    public void searchPublicBoard() {
        goHome();
        gotoPublicBoards();
        findElement(By.name("search")).sendKeys("board");
        clickElement(By.id("search.submit"));
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");
        clickElement(By.id("tag-Cancer"));
        textNotPresent("Epilepsy Board");
        clickElement(By.id("tag-Cancer"));
        textPresent("Epilepsy Board");
        clickElement(By.id("type-form"));
        textNotPresent("Epilepsy Board");
        textPresent("TestQuickboard");
        clickElement(By.id("type-form"));
        textPresent("Epilepsy Board");
    }

    @Test
    public void searchPublicBoardNoResult() {
        goHome();
        gotoPublicBoards();
        textPresent("Cerebral Palsy");
        textPresent("Public Smoking Board");
        findElement(By.name("search")).sendKeys("noResultSearch");
        clickElement(By.id("search.submit"));
        textPresent("No results were found. Try other criteria.");
        findElement(By.name("search")).sendKeys("\u0008");
        textNotPresent("No boards(s) found with search: noResultSearch");
    }
}
