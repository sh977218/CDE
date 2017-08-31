package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublicBoardsTest extends BoardTest {

    @Test
    public void searchPublicBoard() {
        mustBeLoggedOut();
        clickElement(By.id("boardsMenu"));
        findElement(By.name("search")).sendKeys("board");
        clickElement(By.id("search.submit"));
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");
        clickElement(By.id("tag-Cancer"));
        textNotPresent("Epilepsy Board");
        clickElement(By.id("tag-Cancer"));
        textPresent("Epilepsy Board");
    }

    @Test
    public void searchPublicBoardNoResult() {
        mustBeLoggedOut();
        clickElement(By.id("boardsMenu"));
        textPresent("Cerebral Palsy");
        textPresent("Public Smoking Board");
        findElement(By.name("search")).sendKeys("noResultSearch");
        clickElement(By.id("search.submit"));
        textPresent("No results were found. Try other criteria.");
        findElement(By.name("search")).sendKeys("\u0008");
        textNotPresent("No boards(s) found with search: noResultSearch");
    }
}
