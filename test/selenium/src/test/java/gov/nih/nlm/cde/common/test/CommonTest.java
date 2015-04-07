/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;


public abstract class CommonTest extends NlmCdeBaseTest {
    public void goToEltByName(String name) {
        goToEltByName(name, null);
    }
    public abstract void goToEltByName(String name, String status);
    
    public abstract void goToEltSearch();

}
