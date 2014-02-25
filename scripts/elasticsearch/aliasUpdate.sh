       #!/bin/sh
        
curl -XPOST "localhost:9200/_aliases" -d'
        {
            "actions": [
                {
                 "remove": {                                                                                                                                                                                                                          
                    "alias": "nlmcde",                                                                                                                                                                                                              
                    "index": "nlmcde_v4"                                                                                                                                                                                                      
                    }
                },           
                { "add": {
                    "alias": "nlmcde",
                    "index": "nlmcde_v3"
                }}
            ]
        }'