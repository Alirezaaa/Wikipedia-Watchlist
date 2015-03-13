////////////////////////////////////////////////////////////
// Wikipedia watchlist with more options to remove pages. //
//                                                        //
// Author: Alireza (User:علیرضا)                         //
// Distributed under the terms of the CC-BY-SA 4.0        //
////////////////////////////////////////////////////////////
///
///////////////////////////////////////////////////////////////////////////////
//                             Main Functions                                //
///////////////////////////////////////////////////////////////////////////////
// removeByNamespace() - Removes pages by namespace.                         //
// removeRedLinks()    - Removes missing pages.                              //
// removeRedirects()   - Removes redirects.                                  //
// removeStartsWith()  - Removes pages which are started with given strings. //
// removeEndsWith()    - Removes pages which are ended with given strings.   //
///////////////////////////////////////////////////////////////////////////////
///
////////////////////////////////////////////////////////////
//                    How to Use                          //
////////////////////////////////////////////////////////////
// Press F12 on Google Chrome to open developer tools,    //
// then write one of functions which are listed above and //
// read its documentation carefully.                      //
////////////////////////////////////////////////////////////
///
/////////////////////////////////////////////////////////////
//                    Error Reporting                      //
/////////////////////////////////////////////////////////////
// Please consider to report any issue to                  //
// https://github.com/Alirezaaa/Wikipedia-Watchlist/issues //
/////////////////////////////////////////////////////////////
/*jslint regexp: true*/
/*global window: true, document: true, console: true, jQuery: true*/

(function ($) {
    "use strict";
    // Common used variables [START]

    var
        currentURL = decodeURIComponent(document.URL),
        namespaces = {
            0: "اصلی",
            2: "کاربر",
            4: "ویکی\u200cپدیا",
            6: "پرونده",
            8: "مدیاویکی",
            10: "الگو",
            12: "راهنما",
            14: "رده",
            100: "درگاه",
            102: "کتاب",
            446: "برنامه آموزشی",
            828: "پودمان"
        };

    // Common used variables [END]

    // Helper functions [START]

    /**
     * Clears namespaces name from beginning of given list if 'clear' parameter is set,
     * also escapes defined characters for regular expression.
     * @param  {object} list  A list of strings to be escaped.
     * @param  {boolean} clear Whether clear namespaces from beginning of string or not.
     * @return {object}
     */
    function clear_escape(list, clear) {
        if (typeof list !== "object") {
            console.log("First argument must be an object (" + typeof list, "given).");
            return;
        }

        var i;
        for (i = list.length - 1; i >= 0; i - 1) {
            if (clear === true) {
                list[i] = list[i].replace(/^([^\/]+):/gi, "");
            }
            // Following line borrowed from
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
            list[i] = list[i].replace(/[.*+?\^${}()|\[\]\\]/g, "\\$&");
        }
        return list;
    }

    /**
     * Displays changes on the browser console.
     * @param  {string} text The text to be logged.
     * @return {void}
     */
    function logChanges(text) {
        console.log(text);
    }

    /**
     * Saves changed.
     * @return {void}
     */
    function savePage() {
        $(".mw-htmlform-submit-buttons > input[type='submit']").click();
    }

    /**
     * Returns prefered namespace.
     * @param  {string or number} ns Namespace name or number
     * @param  {string} outType      Give only 'string' and 'number'.
     * @return {string or number}    It depends on outType parameter.
     */
    function getNamespace(ns, outType) {
        var
            nsExists = false,
            nsName, nsNumber = null,
            namespace;

        // If given namespace is a string value.
        if (isNaN(ns)) {
            ns = ns.trim();
            for (namespace in namespaces) {
                if (namespaces[namespace] === ns) {
                    nsExists = true;
                    nsNumber = namespace;
                    nsName = ns;
                    break;
                }
            }
            // If given namespace is a number value.
        } else {
            if (namespaces[ns] === undefined) {
                nsExists = false;
            } else {
                nsName = namespaces[ns];
                nsNumber = ns;
            }
        }

        // Log error.
        if (nsExists) {
            if (outType === "string") {
                // The main namespace has no prefix.
                if (nsName === namespaces[0]) {
                    return "";
                }
                return nsName + ":";
            }
            return nsNumber;
        }

        console.log("The given name", ns, "is not valid.");
        return;
    }

    // Helper functions [END]

    /**
     * Removes pages from your watchlist by namespace.
     * @param  {string or number} ns The namespace name or number
     * @param  {object} exceptions   A list of exceptions that won't be removed.
     * @param  {boolean} save        Whether save changes automatically or not.
     * @param  {boolean} log         Wether log changes or not.
     * @return {void}
     */
    window.removeByNamespace = function (ns, exceptions, save, log) {
        exceptions = (exceptions === "undefined") ? [] : clear_escape(exceptions, true);
        // Default value for save parameter is false.
        save = (save === "undefined") ? false : save;
        // Default value for log parameter is true.
        log = (log === "undefined") ? true : log;

        // Only works on watchlist special pages.
        if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
            // On edit watchlist page
            if (currentURL.indexOf("raw") === -1) {
                $("input[name='wpTitlesNs" + getNamespace(ns, "number") + "[]']").each(function () {
                    var
                        hasException = false,
                        i;
                    for (i = exceptions.length - 1; i >= 0; i - 1) {
                        if (new RegExp("^(" + getNamespace(ns, "string") + exceptions[i] + ")", "gi").test($(this).val())) {
                            hasException = true;
                            break;
                        }
                    }
                    if (!hasException) {
                        $(this).prop("checked", true);

                        if (log === true) {
                            logChanges($(this).val());
                        }
                    }
                });
            } else {
                // On edit raw watchlist page
                var contentElement = document.getElementById("mw-input-wpTitles");
                ns = getNamespace(ns, "string");
                contentElement.value = contentElement.value.replace(new RegExp("^(" + ns +
                    ".+)", "gim"), function (p1) {
                    var i, namespace;
                    for (i = exceptions.length - 1; i >= 0; i - 1) {
                        if (new RegExp("^(" + ns + exceptions[i] + ")", "gi").test(p1)) {
                            return p1;
                        }
                    }
                    for (namespace in namespaces) {
                        if (namespaces.hasOwnProperty(namespace) && namespace !== ns.replace(":", "") && new RegExp("^(" + namespace + ":)", "gi").test(p1)) {
                            return p1;
                        }
                    }

                    if (log === true) {
                        logChanges(p1);
                    }

                    return "";
                });
            }

            // Automatically clicks on save button.
            if (save === true) {
                savePage();
            }
        } else {
            console.log("This function only works on watchlist special pages.");
        }
    };

    /**
     * Removes missing pages from your watchlist.
     * NOTE: Only works on edit watchlist page.
     * @param  {object} exceptions  A list of exceptions that won't be removed.
     * @param  {boolean} save       Whether save changes automatically or not.
     * @param  {boolean} log        Wether log changes or not.
     * @return {void}
     */
    window.removeRedLinks = function (exceptions, save, log) {
        exceptions = (exceptions === "undefined") ? [] : clear_escape(exceptions, false);
        // Default value for save parameter is false.
        save = (save === "undefined") ? false : save;
        // Default value for log parameter is true.
        log = (log === "undefined") ? true : log;

        // Only works on edit watchlist page.
        if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1 && currentURL.indexOf("raw") === -1) {
            $(".new").filter(function () {
                if ($(this).text() === $(this).parents(".mw-htmlform-flatlist-item").children("input").val()) {
                    return this;
                }
            }).parents(".mw-htmlform-flatlist-item").children("input").each(function () {
                var
                    hasException = false,
                    i;
                for (i = exceptions.length - 1; i >= 0; i - 1) {
                    if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).val())) {
                        hasException = true;
                        break;
                    }
                }
                if (!hasException) {
                    $(this).prop("checked", true);

                    if (log === true) {
                        logChanges($(this).val());
                    }
                }
            });

            // Automatically clicks on save button.
            if (save === true) {
                savePage();
            }
        } else {
            console.log("This function only works on edit watchlist page.");
        }
    };

    /**
     * Removes redirects from your watchlist.
     * NOTE: Only works on edit watchlist page.
     * @param  {object} exceptions  A list of exceptions that won't be removed.
     * @param  {boolean} save       Whether save changes automatically or not.
     * @param  {boolean} log        Wether log changes or not.
     * @return {void}
     */
    window.removeRedirects = function (exceptions, save, log) {
        exceptions = (exceptions === "undefined") ? [] : clear_escape(exceptions, false);
        // Default value for save parameter is false.
        save = (save === "undefined") ? false : save;
        // Default value for log parameter is true.
        log = (log === "undefined") ? true : log;

        // Only works on edit watchlist page.
        if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1 && currentURL.indexOf("raw") === -1) {
            $(".mw-redirect").filter(function () {
                if ($(this).text() === $(this).parents(".mw-htmlform-flatlist-item").children("input").val()) {
                    return this;
                }
            }).parents(".mw-htmlform-flatlist-item").children("input").each(function () {
                var
                    hasException = false,
                    i;
                for (i = exceptions.length - 1; i >= 0; i - 1) {
                    if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).val())) {
                        hasException = true;
                        break;
                    }
                }
                if (!hasException) {
                    $(this).prop("checked", true);

                    if (log === true) {
                        logChanges($(this).val());
                    }
                }
            });

            // Automatically clicks on save button.
            if (save === true) {
                savePage();
            }
        } else {
            console.log("This function only works on edit watchlist page.");
        }
    };

    /**
     * Removes pages which are started with given strings from your watchlist.
     * @param  {object} these       A list of pages that we search for them.
     * @param  {object} exceptions  A list of exceptions that won't be removed.
     * @param  {boolean} save       Whether save changes automatically or not.
     * @param  {boolean} log        Wether log changes or not.
     * @return {void}
     */
    window.removeStartsWith = function (these, exceptions, save, log) {
        these = (these === "undefined") ? [] : clear_escape(these, false);
        exceptions = (exceptions === "undefined") ? [] : clear_escape(exceptions, false);
        // Default value for save parameter is false.
        save = (save === "undefined") ? false : save;
        // Default value for log parameter is true.
        log = (log === "undefined") ? true : log;

        // Only works on watchlist special pages.
        if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
            // On edit watchlist page
            if (currentURL.indexOf("raw") === -1) {
                $(".mw-htmlform-flatlist-item a").filter(function () {
                    if (($(this).attr("title") === $(this).text()) || ($(this).attr("class") === "new" && $(this).attr("title").replace("(صفحه وجود ندارد)", "").trim() === $(this).text())) {
                        var i;
                        for (i = these.length - 1; i >= 0; i - 1) {
                            if (new RegExp("^(" + these[i] + ")", "gi").test($(this).text())) {
                                return this;
                            }
                        }
                    }
                }).each(function () {
                    var
                        hasException = false,
                        i;
                    for (i = exceptions.length - 1; i >= 0; i - 1) {
                        if (new RegExp("(" + exceptions[i] + ")$", "gi").test($(this).text())) {
                            hasException = true;
                            break;
                        }
                    }
                    if (!hasException) {
                        $(this).parents(".mw-htmlform-flatlist-item").children("input").prop("checked", true);

                        if (log === true) {
                            logChanges($(this).text());
                        }
                    }
                });
            } else {
                // On edit raw watchlist page
                var
                    contentElement = document.getElementById("mw-input-wpTitles"),
                    replaceFunc = function (p1) {
                        var i;
                        for (i = exceptions.length - 1; i >= 0; i - 1) {
                            if (new RegExp("(" + exceptions[i] + ")$", "gi").test(p1)) {
                                return p1;
                            }
                        }

                        if (log === true) {
                            logChanges(p1);
                        }

                        return "";
                    },
                    i;
                for (i = these.length - 1; i >= 0; i - 1) {
                    contentElement.value = contentElement.value.replace(new RegExp("(^(?:" + these[i] + ")(?:.+)?)", "gim"), replaceFunc);
                }
            }

            // Automatically clicks on save button.
            if (save === true) {
                savePage();
            }
        } else {
            console.log("This function only works on watchlist special pages.");
        }
    };

    /**
     * Removes pages which are ended with given strings from your watchlist.
     * NOTE: If you want to search for a subpage, you have to add slash at the beginning of the string.
     * @param  {object} these       A list of pages that we search for them.
     * @param  {object} exceptions  A list of exceptions that won't be removed.
     * @param  {boolean} save       Whether save changes automatically or not.
     * @param  {boolean} log        Wether log changes or not.
     * @return {void}
     */
    window.removeEndsWith = function (these, exceptions, save, log) {
        these = (these === "undefined") ? [] : clear_escape(these, false);
        exceptions = (exceptions === "undefined") ? [] : clear_escape(exceptions, false);
        // Default value for save parameter is false.
        save = (save === "undefined") ? false : save;
        // Default value for log parameter is true.
        log = (log === "undefined") ? true : log;

        // Only works on watchlist special pages.
        if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
            // On edit watchlist page
            if (currentURL.indexOf("raw") === -1) {
                $(".mw-htmlform-flatlist-item a").filter(function () {
                    if (($(this).attr("title") === $(this).text()) || ($(this).attr("class") === "new" && $(this).attr("title").replace("(صفحه وجود ندارد)", "").trim() === $(this).text())) {
                        var i;
                        for (i = these.length - 1; i >= 0; i - 1) {
                            if (new RegExp("(" + these[i] + ")$", "gi").test($(this).text())) {
                                return this;
                            }
                        }
                    }
                }).each(function () {
                    var
                        hasException = false,
                        i;
                    for (i = exceptions.length - 1; i >= 0; i - 1) {
                        if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).text())) {
                            hasException = true;
                            break;
                        }
                    }
                    if (!hasException) {
                        $(this).parents(".mw-htmlform-flatlist-item").children("input").prop("checked", true);

                        if (log === true) {
                            logChanges($(this).text());
                        }
                    }
                });
            } else {
                // On edit raw watchlist page
                var
                    contentElement = document.getElementById("mw-input-wpTitles"),
                    replaceFunc = function (p1) {
                        var i;
                        for (i = exceptions.length - 1; i >= 0; i - 1) {
                            if (new RegExp("^(" + exceptions[i] + ")", "gi").test(p1)) {
                                return p1;
                            }
                        }

                        if (log === true) {
                            logChanges(p1);
                        }

                        return "";
                    },
                    i;
                for (i = these.length - 1; i >= 0; i - 1) {
                    contentElement.value = contentElement.value.replace(new RegExp("((?:.+)?(?:" + these[i] + ")$)", "gim"), replaceFunc);
                }
            }

            // Automatically clicks on save button.
            if (save === true) {
                savePage();
            }
        } else {
            console.log("This function only works on watchlist special pages.");
        }
    };
}(jQuery));