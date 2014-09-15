db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
        {
            "cardinality" : "+",
            "title" : "Demographics"
        }, 
        {
            "cardinality" : "*",
            "title" : "Diseases"
        }
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [{
            "key": "NLMCDE Test Usage"
            , "value": "FormSearchTest"
    }],
    "registrationState" : {
        "registrationStatus" : "Qualified"
    },
    "stewardOrg" : {
        "name" : "CTEP"
    },
    "naming" : [ 
        {
            "designation" : "Skin Cancer Patient",
            "definition" : "Demographics, Patient and Family related Medical History",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ], 
    "classification" : [ 
        {
            "stewardOrg" : {
                "name" : "NINDS"
            },
            "elements" : [ 
                {
                    "name" : "Population",
                    "elements" : [ 
                        {
                            "name" : "Adult"
                        }, 
                        {
                            "name" : "Pediatric"
                        }
                    ]
                }, 
                {
                    "name" : "Disease",
                    "elements" : [ 
                        {
                            "name" : "Headache",
                            "elements" : [ 
                                {
                                    "name" : "Participant/Subject History and Family History",
                                    "elements" : [ 
                                        {
                                            "name" : "General Health History"
                                        }
                                    ]
                                }, 
                                {
                                    "name" : "Classification",
                                    "elements" : [ 
                                        {
                                            "name" : "Supplemental"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]    
});

db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
        {
            "cardinality" : "+",
            "title" : "Demographics"
        }, 
        {
            "cardinality" : "*",
            "title" : "Complains"
        }
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [{
            "key": "NLMCDE Test Usage"
            , "value": "FormSearchTest"
    }],
    "registrationState" : {
        "registrationStatus" : "Qualified"
    },
    "stewardOrg" : {
        "name" : "CTEP"
    },
    "naming" : [ 
        {
            "designation" : "Traumatic Brain Injury - Adverse Events",
            "definition" : "Report of TBI event.",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ],
    "classification" : [ 
        {
            "stewardOrg" : {
                "name" : "DCP"
            },
            "elements" : [ 
                {
                    "name" : "Category",
                    "elements" : [ 
                        {
                            "name" : "Adverse Events",
                            "elements" : []
                        }, 
                        {
                            "name" : "Case Report Forms Version 3",
                            "elements" : []
                        }, 
                        {
                            "name" : "Case Report Forms",
                            "elements" : []
                        }, 
                        {
                            "name" : "SeriousAdverseEvents",
                            "elements" : []
                        }
                    ]
                }
            ]
        }, 
        {
            "stewardOrg" : {
                "name" : "CTEP"
            },
            "elements" : [ 
                {
                    "name" : "CATEGORY",
                    "elements" : [ 
                        {
                            "name" : "Common Terminology Criteria for Adverse Events v3.0",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adverse Events",
                            "elements" : []
                        }, 
                        {
                            "name" : "AdEERS",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "Submission and Reporting",
                    "elements" : [ 
                        {
                            "name" : "AdEERS",
                            "elements" : []
                        }, 
                        {
                            "name" : "Common Terminology Criteria for Adverse Events v3.0",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "USAGE",
                    "elements" : [ 
                        {
                            "name" : "CLINICAL TRIALS",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "CRF_DISEASE",
                    "elements" : [ 
                        {
                            "name" : "Bladder",
                            "elements" : []
                        }, 
                        {
                            "name" : "Breast",
                            "elements" : []
                        }, 
                        {
                            "name" : "Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Leukemia",
                            "elements" : []
                        }, 
                        {
                            "name" : "Lung",
                            "elements" : []
                        }, 
                        {
                            "name" : "Melanoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Prostate",
                            "elements" : []
                        }, 
                        {
                            "name" : "Multiple Myeloma",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "TTU",
                    "elements" : [ 
                        {
                            "name" : "ALL Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "AML Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "APL Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Esophageal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Gastric",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Esophageal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Gastric",
                            "elements" : []
                        }, 
                        {
                            "name" : "CLL Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "CML Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "HCL Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "MDS Prev Untreated",
                            "elements" : []
                        }, 
                        {
                            "name" : "NSCLC 2nd Line",
                            "elements" : []
                        }, 
                        {
                            "name" : "NSCLC Advanced",
                            "elements" : []
                        }, 
                        {
                            "name" : "Primary Cervical",
                            "elements" : []
                        }, 
                        {
                            "name" : "Primary Endometrial",
                            "elements" : []
                        }, 
                        {
                            "name" : "Primary Ovarian",
                            "elements" : []
                        }, 
                        {
                            "name" : "SCLC 2nd Line",
                            "elements" : []
                        }, 
                        {
                            "name" : "SCLC Extensive",
                            "elements" : []
                        }, 
                        {
                            "name" : "SCLC Limited",
                            "elements" : []
                        }, 
                        {
                            "name" : "Unresect Pancreatic",
                            "elements" : []
                        }, 
                        {
                            "name" : "Resect Pancreatic",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adult STS New",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adult STS Recurrent",
                            "elements" : []
                        }, 
                        {
                            "name" : "Ped STS New",
                            "elements" : []
                        }, 
                        {
                            "name" : "Ped STS Recurrent",
                            "elements" : []
                        }, 
                        {
                            "name" : "Multiple Myeloma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Primary Amyloidosis",
                            "elements" : []
                        }, 
                        {
                            "name" : "Waldenstrom Macrogl",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Breast",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Localized Prostate",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Breast",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Melanoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Non-local Prostate",
                            "elements" : []
                        }, 
                        {
                            "name" : "ALL Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "AML Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "APL Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "CLL Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "CML Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "HCL Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "Local-Reg Melanoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "MDS Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "Met/Urothelial",
                            "elements" : []
                        }, 
                        {
                            "name" : "Muscle Invasive Blad",
                            "elements" : []
                        }, 
                        {
                            "name" : "NSCLC Stage I-III",
                            "elements" : []
                        }, 
                        {
                            "name" : "Recurrent Gyn",
                            "elements" : []
                        }, 
                        {
                            "name" : "Superficial Bladder",
                            "elements" : []
                        }, 
                        {
                            "name" : "Bone Sarcoma New",
                            "elements" : []
                        }, 
                        {
                            "name" : "Bone Sarcoma Recur",
                            "elements" : []
                        }, 
                        {
                            "name" : "Curative Head/Neck",
                            "elements" : []
                        }, 
                        {
                            "name" : "Hodgkin's Lymphoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "NonHodgkins Lymphoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Palliative Head/Neck",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "DISEASE",
                    "elements" : [ 
                        {
                            "name" : "Lung",
                            "elements" : []
                        }, 
                        {
                            "name" : "Melanoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Sarcoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Bladder",
                            "elements" : []
                        }, 
                        {
                            "name" : "Breast",
                            "elements" : []
                        }, 
                        {
                            "name" : "Gynecologic",
                            "elements" : []
                        }, 
                        {
                            "name" : "Leukemia",
                            "elements" : []
                        }, 
                        {
                            "name" : "Prostate",
                            "elements" : []
                        }, 
                        {
                            "name" : "Upper GI",
                            "elements" : []
                        }, 
                        {
                            "name" : "Head and Neck",
                            "elements" : []
                        }, 
                        {
                            "name" : "Lymphoma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Brain",
                            "elements" : []
                        }, 
                        {
                            "name" : "Multiple Myeloma",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "CRF_TTU",
                    "elements" : [ 
                        {
                            "name" : "NSCLC Stages",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced",
                            "elements" : []
                        }, 
                        {
                            "name" : "Multiple Myeloma",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Breast",
                            "elements" : []
                        }, 
                        {
                            "name" : "Adjuvant Colorectal",
                            "elements" : []
                        }, 
                        {
                            "name" : "AML Relapse/Refract",
                            "elements" : []
                        }, 
                        {
                            "name" : "Localized Prostate",
                            "elements" : []
                        }, 
                        {
                            "name" : "Met/Urothelial",
                            "elements" : []
                        }, 
                        {
                            "name" : "Advanced Melanoma",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "Phase",
                    "elements" : [ 
                        {
                            "name" : "Phase III",
                            "elements" : []
                        }
                    ]
                }
            ]
        }, 
        {
            "stewardOrg" : {
                "name" : "caBIG"
            },
            "elements" : [ 
                {
                    "name" : "All Candidates",
                    "elements" : [ 
                        {
                            "name" : "CTEP",
                            "elements" : []
                        }
                    ]
                }, 
                {
                    "name" : "SAE Reporting",
                    "elements" : [ 
                        {
                            "name" : "SAE Reporting",
                            "elements" : []
                        }
                    ]
                }
            ]
        }, 
        {
            "stewardOrg" : {
                "name" : "CIP"
            },
            "elements" : [ 
                {
                    "name" : "Adverse Events",
                    "elements" : [ 
                        {
                            "name" : "AE/SAE CDEs",
                            "elements" : []
                        }
                    ]
                }
            ]
        },
        {
            "stewardOrg" : {
                "name" : "NINDS"
            },
            "elements" : [ 
                {
                    "name" : "Population",
                    "elements" : [ 
                        {
                            "name" : "Adult"
                        }, 
                        {
                            "name" : "Pediatric"
                        }
                    ]
                }, 
                {
                    "name" : "Disease",
                    "elements" : [ 
                        {
                            "name" : "Epilepsy",
                            "elements" : [ 
                                {
                                    "name" : "Assessments and Examinations",
                                    "elements" : [ 
                                        {
                                            "name" : "Imaging Diagnostics"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }        
    ]    
});

db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
        {
            "cardinality" : "+",
            "title" : "Demographics"
        }, 
        {
            "cardinality" : "*",
            "title" : "Complains"
        }
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [{
            "key": "NLMCDE Test Usage"
            , "value": "FormSearchTest"
    }],
    "registrationState" : {
        "registrationStatus" : "Candidate"
    },
    "stewardOrg" : {
        "name" : "CTEP"
    },
    "naming" : [ 
        {
            "designation" : "Diabetes - Adverse Event - Patient Report",
            "definition" : "Report of a diabetic patient after an occurance of an adverse event.",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ]
});


db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
        {
            "cardinality" : "+",
            "title" : "Demographics"
        }, 
        {
            "cardinality" : "*",
            "title" : "Complains"
        }
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [{
            "key": "NLMCDE Test Usage"
            , "value": "FormSearchTest"
    }],
    "registrationState" : {
        "registrationStatus" : "Recorded"
    },
    "stewardOrg" : {
        "name" : "CTEP"
    },
    "naming" : [ 
        {
            "designation" : "Vision Deficit Report",
            "definition" : "A detailed report for ophtamologic patients on symptoms of vision problems.",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ],
    "classification" : [ 
        {
            "stewardOrg" : {
                "name" : "NINDS"
            },
            "elements" : [ 
                {
                    "name" : "Population",
                    "elements" : [ 
                        {
                            "name" : "Adult"
                        }, 
                        {
                            "name" : "Pediatric"
                        }
                    ]
                }, 
                {
                    "name" : "Disease",
                    "elements" : [ 
                        {
                            "name" : "Headache",
                            "elements" : [ 
                                {
                                    "name" : "Participant/Subject History and Family History",
                                    "elements" : [ 
                                        {
                                            "name" : "General Health History"
                                        }
                                    ]
                                }, 
                                {
                                    "name" : "Classification",
                                    "elements" : [ 
                                        {
                                            "name" : "Supplemental"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]      
});


db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [],
    "registrationState" : {
        "registrationStatus" : "Recorded"
    },
    "stewardOrg" : {
        "name" : "CTEP"
    },
    "naming" : [ 
        {
            "designation" : "Form Property Test",
            "definition" : "Form to tes properties",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ],
    "classification" : [ 
        {
            "stewardOrg" : {
                "name" : "NINDS"
            },
            "elements" : [ 
                {
                    "name" : "Population",
                    "elements" : [ 
                        {
                            "name" : "Adult"
                        }, 
                        {
                            "name" : "Pediatric"
                        }
                    ]
                }
            ]
        }
    ]      
});


db.forms.insert({
    "version" : "1.01111",
    "__v" : 0,
    "sections" : [ 
    ],
    "createdBy" : {
        "username" : "ctepCurator"
    },
    "history" : [],
    "comments" : [],
    "attachments" : [],
    "ids" : [],
    "properties" : [{
            "key": "Prop 1"
            , "value": "Value 1"
    }, {
            "key": "Prop 2"
            , "value": "Value 2"
    }],
    "registrationState" : {
        "registrationStatus" : "Recorded"
    },
    "stewardOrg" : {
        "name" : "NINDS"
    },
    "naming" : [ 
        {
            "designation" : "Form Rich Text Property Test",
            "definition" : "Form properties",
            "context" : {
                "contextName" : "Health",
                "acceptability" : "preferred"
            }
        }
    ],
    "classification" : [ 
        {
            "stewardOrg" : {
                "name" : "NINDS"
            },
            "elements" : [ 
                {
                    "name" : "Population",
                    "elements" : [ 
                        {
                            "name" : "Adult"
                        }, 
                        {
                            "name" : "Pediatric"
                        }
                    ]
                }
            ]
        }
    ]      
});