package gov.nih.nlm.ninds.form;

import java.util.Date;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class Attachment {
    String fileid;
    String filename;
    String filetype;
    Date uploadDate;
    String comment;
    UploadedBy uploadedBy;
    Integer filesize;
    Boolean isDefault;
    Boolean pendingApproval;
    Boolean scanned;
}