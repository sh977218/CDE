import org.testng.annotations.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.Select;
import java.util.concurrent.TimeUnit;

public class NlmCdeBaseTest {
    
    public static String baseUrl = "http://localhost:3001";
    public static WebDriver driver;
    
    private static String nlm_username = "nlm";
    private static String nlm_password = "nlm";
    private static String test_username = "testuser";
    private static String test_password = "Test123";
    private static String test_reg_auth = "RegAuthTest1";
    
    @BeforeTest
    public void setBaseUrl() {
        driver = new FirefoxDriver();
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
    }
    
    @Test
    public void testLoginAsNlm() {
        loginAs("nlm", "nlm");
        logout();
    }
    
    @Test(priority=0)
    public void testSelfRegister() {
        driver.get(baseUrl + "/");
        driver.findElement(By.linkText("Log In")).click();
        driver.findElement(By.linkText("Sign up")).click();
        driver.findElement(By.name("username")).sendKeys(test_username);
        driver.findElement(By.name("uPassword")).sendKeys(test_password);
        driver.findElement(By.name("ucPassword")).sendKeys(test_password);
        driver.findElement(By.cssSelector("input.btn")).click();
        loginAs(test_username, test_password);
        logout();
    }

    @Test(priority=0)
    public void testAddRegistrationAuthority() {
        loginAs(nlm_username, nlm_password);
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Site Management")).click();
        driver.findElement(By.linkText("Registration Authorities")).click();
        driver.findElement(By.name("newRegAuth.name")).sendKeys(test_reg_auth);
        driver.findElement(By.id("addRegAuth")).click();
        logout();
    }
    
    @Test(priority=1)
    public void testPromoteRegAuthAdmin() {
        loginAs(nlm_username, nlm_password);
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Site Management")).click();
        driver.findElement(By.linkText("Registration Authorities Admins")).click();
        new Select(driver.findElement(By.name("admin.regAuthName"))).selectByVisibleText(test_reg_auth);
        driver.findElement(By.name("regAuthAdmin.username")).sendKeys(test_username);
        driver.findElement(By.id("addRegAuthAdmin")).click();
        logout();
    }
    
    @AfterTest
    public void endSession() {
        driver.quit();
    }
    
    private void logout() {
        driver.findElement(By.linkText("Account")).click();
        driver.findElement(By.linkText("Log Out")).click();
    }
    
    private void loginAs(String username, String password) {
        driver.get(baseUrl + "/");
        driver.findElement(By.linkText("Log In")).click();
        driver.findElement(By.name("username")).clear();
        driver.findElement(By.name("username")).sendKeys(username);
        driver.findElement(By.name("password")).clear();
        driver.findElement(By.name("password")).sendKeys(password);
        driver.findElement(By.cssSelector("input.btn")).click();
    }
    
}
