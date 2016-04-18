package gov.nih.nlm.system;

import org.testng.TestListenerAdapter;

import java.text.SimpleDateFormat;
import java.util.Calendar;

public class VideoRecordListener extends TestListenerAdapter {
    SimpleDateFormat formater = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");
    Calendar calendar = Calendar.getInstance();

}