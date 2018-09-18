package gov.nih.nlm.ninds.form;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "log")
public class MyLog {
    public String info = new String();
    @Id
    private String id;
    private int pageStart = 0;
    private int pageEnd = 0;
    private Date date = new Date();

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

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "MyLog{" +
                "id='" + id + '\'' +
                ", pageStart=" + pageStart +
                ", pageEnd=" + pageEnd +
                ", date=" + date +
                ", info=" + info +
                '}';
    }
}
