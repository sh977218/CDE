import org.testng.annotations.*;
import org.testng.Assert;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.util.concurrent.TimeUnit;

public class NlmCdeBaseTest {
    
    public static String baseUrl = "http://localhost:3001";
    public static WebDriver driver;
    
    private static String nlm_username = "nlm";
    private static String nlm_password = "nlm";
    private static String cabigAdmin_username = "cabigAdmin";
    private static String cabigAdmin_password = "pass";
    private static String test_username = "testuser";
    private static String test_password = "Test123";
    private static String test_reg_auth = "OrgTest1";
    
    public static WebDriverWait wait;

    
    @BeforeTest
    public void setBaseUrl() {
        driver = new FirefoxDriver();
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
        wait = new WebDriverWait(driver, 3);
    }
    
    @Test
    public void loginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
    
    @Test
    public void cdeFullDetail() {
        driver.get(baseUrl + "/");
        goToCdeByName("enotype Therapy Basis Mutation");
        Assert.assertTrue(textPresent("Genotype Therapy Basis Mutation Analysis Indicator"));
        Assert.assertTrue(textPresent("3157849v1"));
        Assert.assertTrue(textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing"));
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Unknown"));
        findElement(By.linkText("DE Concepts")).click();
        Assert.assertTrue(textPresent("Mutation Analysis"));
        Assert.assertTrue(textPresent("C18302"));
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("This Data Element has no history"));
    } 

    
    @Test
    public void selfRegister() {
        driver.get(baseUrl + "/");
        findElement(By.linkText("Log In")).click();
        findElement(By.linkText("Sign up")).click();
        findElement(By.name("username")).sendKeys(test_username);
        findElement(By.name("uPassword")).sendKeys(test_password);
        findElement(By.name("ucPassword")).sendKeys(test_password);
        findElement(By.cssSelector("input.btn")).click();
        loginAs(test_username, test_password);
        logout();
    }
    
    @Test (dependsOnMethods = {"selfRegister"})
    public void comments() {
        loginAs(test_username, test_password);
        goToCdeByName("Hospital Confidential Institution Referred From");
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys("My First Comment!");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("comment")).sendKeys("another comment");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        findElement(By.xpath("//div[3]/div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("another comment") < 0);
        logout();        
    }

    @Test(priority=0)
    public void addOrg() {
        loginAs(nlm_username, nlm_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations")).click();
        findElement(By.name("newOrg.name")).sendKeys(test_reg_auth);
        findElement(By.id("addOrg")).click();
        logout();
    }
    
    @Test(dependsOnMethods = {"selfRegister", "addOrg"})
    public void promoteOrgAdmin() {
        loginAs(nlm_username, nlm_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Organizations Admins")).click();
        new Select(driver.findElement(By.name("admin.orgName"))).selectByVisibleText(test_reg_auth);
        findElement(By.name("orgAdmin.username")).sendKeys(test_username);
        findElement(By.id("addOrgAdmin")).click();
        logout();
        loginAs(test_username, test_password);
        findElement(By.linkText("Create")).click();
        // following will assert that test user was indeed promoted
        new Select(driver.findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText(test_reg_auth);                
        logout();
    }
    
    @Test(dependsOnMethods = {"promoteOrgAdmin"}) 
    public void createCde() {
        loginAs(test_username, test_password);
        findElement(By.linkText("Create")).click();
        findElement(By.name("cde.designation")).sendKeys("name of testuser CDE 1");
        findElement(By.name("cde.definition")).sendKeys("Definition for testUser CDE 1");
        findElement(By.name("cde.version")).sendKeys("1.0alpha1");
        new Select(findElement(By.name("cde.stewardOrg.name"))).selectByVisibleText(test_reg_auth);
        findElement(By.id("cde.submit")).click();
        driver.get(baseUrl + "/");
        findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        findElement(By.id("search.submit")).click();
        findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1")).click();
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("Definition for testUser CDE 1"));
        logout();
    }

    @Test(dependsOnMethods = {"createCde"})
    public void editCde() {
        loginAs(test_username, test_password);
        goToCdeByName("name of testuser CDE 1");
        findElement(By.cssSelector("i.icon-pencil")).click();
        findElement(By.xpath("//inline-edit/div/div[2]/input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector("button.icon-ok")).click();
        findElement(By.cssSelector("inline-area-edit.ng-isolate-scope.ng-scope > div > div.ng-binding > i.icon-pencil")).click();
        findElement(By.xpath("//inline-area-edit/div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//inline-area-edit/div/div[2]/button")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("2");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        findElement(By.linkText("CDEs")).click();
        findElement(By.name("search.name")).sendKeys("testUser CDE 1");
        findElement(By.id("search.submit")).click();
        findElement(By.linkText(test_reg_auth + " -- name of testuser CDE 1[name change number 1]")).click();
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("1.0alpha2"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
        logout();
    }
        
    @Test(dependsOnMethods = {"editCde"})
    public void editHistory() {
        goToCdeByName("name of testuser CDE 1");
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        findElement(By.xpath("//tr[2]//td[4]/i")).click();
        Assert.assertTrue(textPresent("name of testuser CDE 1[name change number 1]"));
        Assert.assertTrue(textPresent("Definition for testUser CDE 1[def change number 1]"));
    }
    
    @Test
    public void orgAdminCanEditHisCdes() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName("Cervical Tumor Clinical T Stage");
        Assert.assertTrue(textPresent("as defined by the AJCC Cancer Staging Manual, 6th Ed."));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("i.icon-pencil")));
        goToCdeByName("Communication Contact Email Address java.lang.String");
        Assert.assertTrue(textPresent("A modern Internet e-mail address (using SMTP)"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.icon-pencil")));
        logout();
    }
    
    @Test
    public void orgAdminTasks() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.linkText("Organizations Curators")).click();       
        new Select(findElement(By.name("curator.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgCurator.username")).sendKeys("user1");
        findElement(By.id("addOrgCurator")).click();
        Assert.assertTrue(textPresent("Organization Curator Added"));
        Assert.assertTrue(textPresent("user1"));
        findElement(By.xpath("//div[2]/div/div[2]/div/div[2]/i")).click();
        Assert.assertTrue(textPresent("Organization Curator Removed"));
        Assert.assertTrue(findElement(By.cssSelector("BODY")).getText().indexOf("user1") < 0);

        findElement(By.linkText("Organizations Admins")).click();       
        new Select(findElement(By.name("admin.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgAdmin.username")).sendKeys("user1");
        findElement(By.id("addOrgAdmin")).click();
        Assert.assertTrue(textPresent("Organization Administrator Added"));
        Assert.assertTrue(textPresent("user1"));
        findElement(By.xpath("//div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Organization Administrator Removed"));
        Assert.assertTrue(findElement(By.cssSelector("BODY")).getText().indexOf("user1") < 0);
        logout();
    }
    
    @Test
    public void changeRegistrationStatus() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Qualified"));
        findElement(By.cssSelector("dd.ng-binding > i.icon-pencil")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Recorded");
        findElement(By.name("effectiveDate")).sendKeys("9/15/2013");
        findElement(By.name("untilDate")).sendKeys("10/31/2014");
        findElement(By.name("administrativeNote")).sendKeys("Admin Note 1");
        findElement(By.name("unresolvedIssue")).sendKeys("Unresolved Issue 1");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Investigator Identifier java.lang.Integer");
        Assert.assertTrue(textPresent("Recorded"));
        findElement(By.linkText("Status")).click();
        Assert.assertTrue(textPresent("Recorded"));
        Assert.assertTrue(textPresent("09/15/2013"));
        Assert.assertTrue(textPresent("10/31/2014"));
        Assert.assertTrue(textPresent("Admin Note 1"));
        Assert.assertTrue(textPresent("Unresolved Issue 1"));
        logout();
    }
    
    private void goToCdeByName(String name) {
        driver.get(baseUrl + "/");
        findElement(By.name("search.name")).sendKeys(name);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(name)).click();
        findElement(By.linkText("View Full Detail")).click();
    }
        
    
    private WebElement findElement(By by) {
        wait.until(ExpectedConditions.presenceOfElementLocated(by));
        return driver.findElement(by);
    }
    
    @AfterTest
    public void endSession() {
        driver.quit();
    }
    
    public boolean textPresent(String text) {
        wait.until(ExpectedConditions.textToBePresentInElement(By.cssSelector("BODY"), text));
        return driver.findElement(By.cssSelector("BODY")).getText().indexOf(text) > 0;
    }
    
    private void logout() {
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Log Out")).click();
    }
    
    private void loginAs(String username, String password) {
        driver.get(baseUrl + "/");
        findElement(By.linkText("Log In")).click();
        findElement(By.name("username")).clear();
        findElement(By.name("username")).sendKeys(username);
        findElement(By.name("password")).clear();
        findElement(By.name("password")).sendKeys(password);
        findElement(By.cssSelector("input.btn")).click();
    }
    
}
