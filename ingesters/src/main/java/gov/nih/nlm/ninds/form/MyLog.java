package gov.nih.nlm.ninds.form;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "log")
public class MyLog {
    @Id
    private String id;
    private int pageStart = 0;
    private int pageEnd = 0;
    private long runTime = 0;
    public List<String> info = new ArrayList<String>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getPageStart() {
        return pageStart;
    }

    public void setPageStart(int pageStart) {
        this.pageStart = pageStart;
    }

    public int getPageEnd() {
        return pageEnd;
    }

    public void setPageEnd(int pageEnd) {
        this.pageEnd = pageEnd;
    }

    public long getRunTime() {
        return runTime;
    }

    public void setRunTime(long runTime) {
        this.runTime = runTime;
    }

    @Override
    public String toString() {
        return "MyLog{" +
                "id='" + id + '\'' +
                ", pageStart=" + pageStart +
                ", pageEnd=" + pageEnd +
                ", runTime=" + runTime +
                ", info=" + info +
                '}';
    }
}
