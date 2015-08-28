package gov.nih.nlm.ninds.form;

import java.util.Collection;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class NindsFormRunner {

    public static void main(String[] args) {
        long timeStart = System.currentTimeMillis();
        Collection<MyForm> myForms = new CopyOnWriteArraySet<MyForm>();
        Thread[] t = new Thread[1];

        NindsFormLoader runner1 = new NindsFormLoader(myForms, 1, 1);
        t[0] = new Thread(runner1);
/*        NindsFormLoader runner2 = new NindsFormLoader(myForms, 4, 6);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(myForms, 7, 9);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(myForms, 10, 12);
        t[3] = new Thread(runner4);
        NindsFormLoader runner5 = new NindsFormLoader(myForms, 13, 15);
        t[4] = new Thread(runner5);
        NindsFormLoader runner6 = new NindsFormLoader(myForms, 16, 18);
        t[5] = new Thread(runner6);
        NindsFormLoader runner7 = new NindsFormLoader(myForms, 19, 21);
        t[6] = new Thread(runner7);
        NindsFormLoader runner8 = new NindsFormLoader(myForms, 22, 24);
        t[7] = new Thread(runner8);
        NindsFormLoader runner9 = new NindsFormLoader(myForms, 25, 26);
        t[8] = new Thread(runner9);
*/

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
        long timeEnd = System.currentTimeMillis();
        long timeTake = (timeEnd - timeStart) / 6000;
    }

}
