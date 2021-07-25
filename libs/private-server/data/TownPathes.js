
Town.pathes = {
    act1: {
        /**
        *	@示例 from为起点，to为终点，x,y为路线节点相对火堆的坐标，breakBarrier为此节点踢捅次数，如不需踢则可以不写
        	
            //地图类型：type1
            type1: [
                //所有地方去小站 [fire+27, fire-40]
                {
                    from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                    to: ["waypoint"],
                    path: [
                        {
                            x: 27,
                            y: - 36,
                        },
                        {
                            x: 27,
                            y: - 40,
                            breakBarrier: 6
                        }
                    ]
                },
                //所有地方去出口（除了小站）
                {
                    from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                    to: ["exit"],
                    path: [
                        {
                            x: 82,
                            y: 0,
                            breakBarrier: 3
                        }
                    ]
                },
            ],
    
            type2: [ ...
        */

        //地图类型：出口左上
        type1: [
            //所有地方去小站 [fire+27, fire-40]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 27,
                        y: - 40,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方[fire+22, fire-38]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 22,
                        y: - 38,
                        breakBarrier: 4
                    },
                    {
                        x: 27,
                        y: - 40
                    }
                ]
            }
        ],

        //地图类型：出口右下
        type2: [
            //所有地方去小站 [fire+26, fire-25]	
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 26,
                        y: - 25,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方 [fire+24, fire-28]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 4
                    },
                    {
                        x: 26,
                        y: - 25
                    }
                ]
            },
            //所有地方去出口
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["exit"],
                path: [
                    {
                        x: 83,
                        y: 4,
                        breakBarrier: 3
                    }
                ]
            },
            //小站去出口
            {
                from: ["waypoint"],
                to: ["exit"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 6
                    },
                    {
                        x: 26,
                        y: - 25
                    },
                    {
                        x: 83,
                        y: 4,
                        breakBarrier: 3
                    }
                ]
            },
        ],

        //地图类型：出口左下，封传送门
        type3: [
            //所有地方去小站(除了传送门) [fire-21, fire-34]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                to: ["waypoint"],
                path: [
                    {
                        x: - 21,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了传送门) [fire-22, fire-39]  [fire-21, fire-30] 
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                path: [
                    {
                        x: 22,
                        y: - 29,
                        breakBarrier: 4
                    },
                    {
                        x: 24,
                        y: - 24
                    }
                ]
            },
            //所有地方去传送门(除了小站)  [fire+12, fire+11] 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                to: ["portalspot"],
                path: [
                    {
                        x: 12,
                        y: 11,
                        breakBarrier: 3
                    }
                ]
            },
            //传送门去所有地方(除了小站) [fire+15, fire+18] [fire+12, fire+11] 
            {
                from: ["portalspot"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                path: [
                    {
                        x: 15,
                        y: 18,
                        breakBarrier: 3
                    },
                    {
                        x: 12,
                        y: 11
                    }
                ]
            },
            //传送门去小站
            {
                from: ["portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 15,
                        y: 18,
                        breakBarrier: 3
                    },
                    {
                        x: 12,
                        y: 11
                    },
                    {
                        x: - 21,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去传送门
            {
                from: ["waypoint"],
                to: ["portalspot"],
                path: [
                    {
                        x: 22,
                        y: - 29,
                        breakBarrier: 4
                    },
                    {
                        x: 24,
                        y: - 24
                    },
                    {
                        x: 12,
                        y: 11,
                        breakBarrier: 3
                    }
                ]
            }
        ],

        //地图类型：出口右上，封阿卡拉
        type4: [
            //所有地方去小站(除了阿卡拉) 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了阿卡拉) 
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    }
                ]
            },
            //所有地方去阿卡拉(除了小站)  [fire+47, fire-26]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: [NPC.Akara],
                path: [
                    {
                        x: 48,
                        y: - 27,
                        breakBarrier: 4
                    }
                ]
            },
            //阿卡拉去所有地方(除了小站)  [fire+15, fire-52]
            {
                from: [NPC.Akara],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 15,
                        y: - 52
                    }
                ]
            },
            //阿卡拉去小站
            {
                from: [NPC.Akara],
                to: ["waypoint"],
                path: [
                    {
                        x: 15,
                        y: - 52
                    },
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去阿卡拉
            {
                from: ["waypoint"],
                to: [NPC.Akara],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    },
                    {
                        x: 48,
                        y: - 27,
                        breakBarrier: 4
                    }
                ]
            }
        ],

        //地图类型：出口左下，封阿卡拉
        type5: [
            //所有地方去小站(除了阿卡拉) [fire-11, fire-34]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 11,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了阿卡拉) [fire-7, fire-35]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: - 7,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 11,
                        y: - 34
                    }
                ]
            },
            //所有地方去阿卡拉(除了小站)  [fire+47, fire-26] 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: [NPC.Akara],
                path: [
                    {
                        x: 38,
                        y: - 19,
                        breakBarrier: 4
                    }
                ]
            },
            //阿卡拉去所有地方(除了小站)  [fire+15, fire-52]
            {
                from: [NPC.Akara],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 35,
                        y: - 25,
                        breakBarrier: 4  //踢捅以防万一传送门开在了阿卡拉身边
                    },
                    {
                        x: 38,
                        y: - 19
                    }
                ]
            },
            //阿卡拉去小站
            {
                from: [NPC.Akara],
                to: ["waypoint"],
                path: [
                    {
                        x: 35,
                        y: - 25,
                        breakBarrier: 4 //踢捅以防万一传送门开在了阿卡拉身边
                    },
                    {
                        x: 38,
                        y: - 19
                    },
                    {
                        x: - 11,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去阿卡拉
            {
                from: ["waypoint"],
                to: [NPC.Akara],
                path: [
                    {
                        x: - 7,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 11,
                        y: - 34
                    },
                    {
                        x: 38,
                        y: - 19,
                        breakBarrier: 4
                    }
                ]
            }
        ],

        //地图类型：出口右上 不封阿卡拉
        type6: [
            //所有地方去小站 [fire-24, fire-32]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot", "waypoint"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方 [fire-29, fire-35]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot", "waypoint"],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    }
                ]
            }
        ],

        //地图类型：出口右下
        type7: [
            //所有地方去小站 [fire+26, fire-25]	
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 26,
                        y: - 25,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方 [fire+24, fire-28]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 4
                    },
                    {
                        x: 26,
                        y: - 25
                    }
                ]
            },
            //所有地方去出口
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["exit"],
                path: [
                    {
                        x: 83,
                        y: 4,
                        breakBarrier: 3
                    }
                ]
            },
            //小站去出口
            {
                from: ["waypoint"],
                to: ["exit"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 6
                    },
                    {
                        x: 26,
                        y: - 25
                    },
                    {
                        x: 83,
                        y: 4,
                        breakBarrier: 3
                    }
                ]
            },
        ],

    },
};