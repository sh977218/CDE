package gov.nih.nlm.ninds.form;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class NindsFormRunner {

    public static void main(String[] args) {
        Thread[] t = new Thread[1];
/*
        NindsFormLoader runner1 = new NindsFormLoader(1, 1);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(2, 2);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(3, 3);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(4, 4);
        t[3] = new Thread(runner4);

        NindsFormLoader runner1 = new NindsFormLoader(5, 5);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(6, 6);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(7, 7);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(8, 8);
        t[3] = new Thread(runner4);

        NindsFormLoader runner1 = new NindsFormLoader(9, 9);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(10, 10);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(11, 11);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(12, 12);
        t[3] = new Thread(runner4);

        NindsFormLoader runner1 = new NindsFormLoader(13, 13);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(14, 14);
        t[1] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(15, 15);
        t[2] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(16, 16);
        t[3] = new Thread(runner4);

        NindsFormLoader runner1 = new NindsFormLoader(17, 17);
        t[0] = new Thread(runner1);
        NindsFormLoader runner2 = new NindsFormLoader(18, 18);
        t[0] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(19, 19);
        t[0] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(20, 20);
        t[0] = new Thread(runner4);
*/
        NindsFormLoader runner1 = new NindsFormLoader(21, 21);
        t[0] = new Thread(runner1);
/*
		NindsFormLoader runner2 = new NindsFormLoader(22, 22);
        t[0] = new Thread(runner2);
        NindsFormLoader runner3 = new NindsFormLoader(23, 23);
        t[0] = new Thread(runner3);
        NindsFormLoader runner4 = new NindsFormLoader(24, 24);
        t[0] = new Thread(runner4);

/*
        NindsFormLoader runner1 = new NindsFormLoader(25, 25);
        t[0] = new Thread(runner1);

        NindsFormLoader runner2 = new NindsFormLoader(26, 26);
        t[0] = new Thread(runner2);
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
    }
}
