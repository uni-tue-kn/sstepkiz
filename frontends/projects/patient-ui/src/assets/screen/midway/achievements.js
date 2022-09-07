/*jslint sloppy: true */

ACHIEVEMENTS = {
/*
    "buy" : [
    ],
*/
/*
    "sell" : [
    ],
*/
    "put" : [ // second arguments is object containing { is_wearing_all_names, is_wearing_all_types }
        {
            title : "Voll vollgeklebt!",
            task : "Beklebe Sascha mit allen Pflastern gleichzeitig.",
            check : function (unused_data, funs) {
                return funs.is_wearing_all_types([
                    "bandagehandright",
                    "bandagewristright",
                    "bandageelbowright",
                    "bandagearmright",
                    "bandagearmleft",
                    "bandageelbowleft",
                    "bandagewristleft",
                    "bandagehandleft",
                    "bandagechin",
                    "bandagelegleft",
                    "bandagelegright"
                ]);
            }
            // TODO reward? -> "Zahnl&uuml;ckengrinsen"
        },
        {
            title : "Pokahontas!",
            task : "Ziehe Sascha alles Federm&auml;ssige an.", // &szlig;
            check : function (unused_data, funs) {
                return funs.is_wearing_all_names([
                    "Stirnband",
                    "Friedenstaube",
                    "Karrotenvogel",
                    "Schokobaerfeder",
                    "Tauber Adler",
                    "Federschoner",
                    "Federschutz"
                ]);
            }
            // TODO reward? -> "Mentor Bruder Manitu-Shirt"
        },
        {
            title : "Murks Ahoi!",
            task : "Bekleide Sascha mit Piratenkluft.",
            check : function (unused_data, funs) {
                return funs.is_wearing_all_names([
                    "Piratenkrone",
                    "Augenklappen Gucker",
                    "Gesichtskraken",
                    "Murksefeuerer",
                    "Hakenarm",
                    "Unterarmkraken",
                    "Skullhose",
                    "Strumpf Ahoi",
                    "Mit Holzbein"
                ]) && (funs.is_wearing_all_names(["Ahoi!"]) || funs.is_wearing_all_names(["Piratenmurks!"]));
            }
            // TODO reward? -> "Kinnkraken / Beschw&ouml;rfisch"
        },
        {
            title : "Spitzfindig!",
            task : "Bringe Sacha mal alle Murkseh&ouml;rner an den K&ouml;rper!",
            check : function (unused_data, funs) {
                return funs.is_wearing_all_names([
                    "Murksehorn",
                    "Murkseschuetzer-1",
                    "Piekserschlinger",
                    "Piekserpantoffeln",
                    "Murksemeisterinnenbeschwoerkrone"
                ])  && (funs.is_wearing_all_names(["Nasenhaarnashorn"]) || funs.is_wearing_all_names(["Schulterhorn"]));
            }
            // TODO reward? -> "Murkseausseher"
        }
    ],
/*
    "off" : [
    ],
*/
    "summon" : [ // first argument is array containing [number, name], second is object containing { has_summoned_all_names }
        {
            title : "Haarig!",
            task : "Beschw&ouml;re alle Wuschelmurkse.",
            check : function (unused_data, funs) {
                return funs.has_summoned_all_names([
                    "Kamm",
                    "Natz",
                    "Popow"
                ]);
            }
            // TODO reward? -> "BeschwörerInenkamm"
        },
        {
            title : "MurksemeisterIna!",
            task : "Beschw&ouml;re 13 Murkse.", // TODO number not given in source material ("x")
            check : function (array) {
                return array[0] === 13; // assuming there are at least this number
            }
            // TODO reward? -> "Murkseaugen"
        },
        {
            title : "HILFE!!!",
            task : "Beschw&ouml;re Ute, den &auml;ngstlichen Riesenorangutan.",
            check : function (array) {
                return array[1] === "Ute";
            }
            // TODO reward? -> "" (nothing in source material)
        },
        {
            title : "Absolut Murks!",
            task : "Beschw&ouml;re alle Murkse.", // and Ute the ape
            check : function (array) {
                return array[0] === 51; // assuming there are only 51
            }
            // TODO reward? -> "Murksebschw&ouml;rmeisterInnenriesenkrone"
        }
    ] // ,
/*
    "zoom" : [ // first argument is name of zoomed murks
    ],
*/
/*
    "photo" : [
    ]
*/
};
