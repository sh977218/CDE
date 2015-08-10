package gov.nih.nlm.ninds.form;

import com.google.gson.Gson;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class NindsFormRunner {

    public static void main(String[] args) {
        Set<Form> forms = new CopyOnWriteArraySet<Form>();
        Thread[] t = new Thread[8];

        NindsFormLoader runner1 = new NindsFormLoader(forms, 1, 4);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(forms, 5, 8);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(forms, 9, 12);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(forms, 13, 16);
        t[3] = new Thread(runner4);
        NindsFormLoader runner5 = new NindsFormLoader(forms, 17, 20);
        t[4] = new Thread(runner5);
        NindsFormLoader runner6 = new NindsFormLoader(forms, 21, 24);
        t[5] = new Thread(runner6);
        NindsFormLoader runner7 = new NindsFormLoader(forms, 21, 24);
        t[6] = new Thread(runner7);
        NindsFormLoader runner8 = new NindsFormLoader(forms, 25, 26);
        t[7] = new Thread(runner8);

        for (int i = 0; i < t.length; i++) {
            t[i].start();
        }
        for (int i = 0; i < t.length; i++) {
            try {
                t[i].join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        saveToJson(forms);

    }

    public static void saveToJson(Set<Form> forms) {
        Gson gson = new Gson();
        String json = gson.toJson(forms);
        try {
            FileWriter writer = new FileWriter("C:\\NLMCDE\\nindsForms.json");
            writer.write(json);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
