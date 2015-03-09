/*
 * Remove pages from your watchlist.
 * You have to run this tool from console, because of rarely use.
 *
 * Author: Alireza (User:علیرضا)
 * Distributed under the terms of the CC-BY-SA 4.0
 */

/* HOW TO USE
 * Press F12 on Google Chrome to open developer tools,
 * then write one of functions which are listed below and
 * read its documentation carefully.
 */

/* MAIN FUNCTIONS
 * removeByNamespace - Removes pages by namespace.
 * removeRedLinks    - Removes missing pages.
 * removeRedirects   - Removes redirects.
 * removeStartsWith  - Removes pages which are started with given strings.
 * removeEndsWith    - Removes pages which are ended with given strings.
 */

// Common used variables [START]

// Current URL
var currentURL = decodeURIComponent(document.URL);

// Namespaces supported
var namespaces = {
	"اصلی": 0,
	"کاربر": 2,
	"ویکی\u200cپدیا": 4,
	"پرونده": 6,
	"مدیاویکی": 8,
	"الگو": 10,
	"راهنما": 12,
	"رده": 14,
	"درگاه": 100,
	"کتاب": 102,
	"برنامه آموزشی": 446,
	"پودمان": 828
};

// Common used variables [END]

// Helper functions [START]

// Clears namespaces name from beginning of given list if 'clear' parameter is set,
// also escapes defined characters for regular expression.
function clear_escape(list, clear) {
	if (typeof list === 'object') {
		for (var i = list.length - 1; i >= 0; i--) {
			if (clear === true)
				list[i] = list[i].replace(/^([^/]+):/gi, '');
			// Following line borrowed from
			// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
			list[i] = list[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		return list;
	} else {
		console.log("First argument must be an object (" + typeof list, "given).");
		return;
	}
}

// Display log changes.
function logChanges(string) {
	console.log(string);
}

// Automatically clicks on save button.
function savePage() {
	$(".mw-htmlform-submit-buttons > input[type='submit']").click();
}

// Check namespace and log errors if any error found, otherwise return prefered namespace (namespace in string or number).
function getNamespace(ns, outType) {
	// Check if the input is string not a number.
	var nsExists = true;
	var nsName, nsNumber = null;
	if (isNaN(ns)) {
		if (namespaces[ns] === undefined) nsExists = false;
		else {
			nsName = ns;
			nsNumber = namespaces[ns];
		}
	} else {
		for (var namespace in namespaces) {
			if (namespaces[namespace] == ns) {
				nsExists = true;
				nsNumber = ns;
				nsName = namespace;
				break;
			} else nsExists = false;
		}
	}

	// Log error.
	if (!nsExists) {
		console.log("The given name", ns, "is not valid.");
		return;
		// Return prefered namespace.
	} else {
		if (outType == "string") {
			if (nsName == "اصلی") return "";
			return nsName + ":";
		} else return nsNumber;
	}
}

// Helper functions [END]

/* Removes pages from your watchlist by namespace.
 *
 * Parameters:
 ** ns         - The namespace name or number
 ** exceptions - A list of exceptions that won't be removed.
 ** save       - Whether save changes automatically or not.
 ** log        - Wether log changes or not.
 */
function removeByNamespace(ns, exceptions, save, log) {
	exceptions = (typeof exceptions !== "undefined") ? clear_escape(exceptions, true) : [];
	// Default value for save parameter is false.
	save = (typeof save === "undefined") ? false : save;
	// Default value for log parameter is true.
	log = (typeof log === "undefined") ? true : log;

	// Only works on watchlist special pages.
	if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
		// On edit watchlist page
		if (currentURL.indexOf("raw") == -1) {
			$("input[name='wpTitlesNs" + getNamespace(ns, "number") + "[]']").each(function(index) {
				var hasException = false;
				for (var i = exceptions.length - 1; i >= 0; i--) {
					if (new RegExp("^(" + getNamespace(ns, "string") + exceptions[i] + ")", "gi").test($(this).val())) {
						hasException = true;
						break;
					}
				}
				if (!hasException) {
					$(this).prop("checked", true);

					// Log changes.	
					if (log === true)
						logChanges($(this).val());
				}
			});
		}
		// On edit raw watchlist page
		else {
			var contentElement = document.getElementById("mw-input-wpTitles");
			ns = getNamespace(ns, "string");
			contentElement.value = contentElement.value.replace(new RegExp("^(" + ns +
				".+)", 'gim'), function(match, p1, offset, string) {
				for (var i = exceptions.length - 1; i >= 0; i--)
					if (new RegExp("^(" + ns + exceptions[i] + ")", "gi").test(p1))
						return p1;
				for (var namespace in namespaces)
					if (namespace != ns.replace(":", "") && new RegExp("^(" + namespace + ":)", "gi").test(p1))
						return p1;

					// Log changes.	
				if (log === true)
					logChanges(p1);

				return "";
			});
		}

		// Automatically clicks on save button.
		if (save === true)
			savePage();
	} else
		console.log("This function only works on watchlist special pages.");
}

/* Removes missing pages from your watchlist.
 * NOTE: Only works on edit watchlist page.
 *
 * Parameters:
 ** exceptions - A list of exceptions that won't be removed.
 ** save       - Whether save changes automatically or not.
 ** log        - Wether log changes or not.
 */
function removeRedLinks(exceptions, save, log) {
	exceptions = (typeof exceptions !== "undefined") ? clear_escape(exceptions, false) : [];
	// Default value for save parameter is false.
	save = (typeof save === 'undefined') ? false : save;
	// Default value for log parameter is true.
	log = (typeof log === 'undefined') ? true : log;

	// Only works on edit watchlist page.
	if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1 && currentURL.indexOf("raw") == -1) {
		$(".new").filter(function(index) {
			if ($(this).text() == $(this).parents(".mw-htmlform-flatlist-item").children("input").val())
				return this;
		}).parents(".mw-htmlform-flatlist-item").children("input").each(function(index) {
			var hasException = false;
			for (var i = exceptions.length - 1; i >= 0; i--) {
				if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).val())) {
					hasException = true;
					break;
				}
			}
			if (!hasException) {
				$(this).prop("checked", true);

				// Log changes.	
				if (log === true)
					logChanges($(this).val());
			}
		});

		// Automatically clicks on save button.
		if (save === true)
			savePage();
	} else
		console.log("This function only works on edit watchlist page.");
}

/* Removes redirects from your watchlist.
 * NOTE: Only works on edit watchlist page.
 *
 * Parameters:
 ** exceptions - A list of exceptions that won't be removed.
 ** save       - Whether save changes automatically or not.
 ** log        - Wether log changes or not.
 */
function removeRedirects(exceptions, save, log) {
	exceptions = (typeof exceptions !== "undefined") ? clear_escape(exceptions, false) : [];
	// Default value for save parameter is false.
	save = (typeof save === 'undefined') ? false : save;
	// Default value for log parameter is true.
	log = (typeof log === 'undefined') ? true : log;

	// Only works on edit watchlist page.
	if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1 && currentURL.indexOf("raw") == -1) {
		$(".mw-redirect").filter(function(index) {
			if ($(this).text() == $(this).parents(".mw-htmlform-flatlist-item").children("input").val())
				return this;
		}).parents(".mw-htmlform-flatlist-item").children("input").each(function(index) {
			var hasException = false;
			for (var i = exceptions.length - 1; i >= 0; i--) {
				if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).val())) {
					hasException = true;
					break;
				}
			}
			if (!hasException) {
				$(this).prop("checked", true);

				// Log changes.	
				if (log === true)
					logChanges($(this).val());
			}
		});

		// Automatically clicks on save button.
		if (save === true)
			savePage();
	} else
		console.log("This function only works on edit watchlist page.");
}

/* Removes pages which are started with given strings from your watchlist.
 *
 * Parameters:
 ** these      - A list of pages that we search for them.
 ** exceptions - A list of exceptions that won't be removed.
 ** save       - Whether save changes automatically or not.
 ** log        - Wether log changes or not.
 */
function removeStartsWith(these, exceptions, save, log) {
	these = (typeof these !== "undefined") ? clear_escape(these, false) : [];
	exceptions = (typeof exceptions !== "undefined") ? clear_escape(exceptions, false) : [];
	// Default value for save parameter is false.
	save = (typeof save === 'undefined') ? false : save;
	// Default value for log parameter is true.
	log = (typeof log === 'undefined') ? true : log;

	// Only works on watchlist special pages.
	if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
		// On edit watchlist page
		if (currentURL.indexOf("raw") == -1) {
			$(".mw-htmlform-flatlist-item a").filter(function(index) {
				if ($(this).attr("title") == $(this).text()) {
					for (var i = these.length - 1; i >= 0; i--)
						if (new RegExp("^(" + these[i] + ")", "gi").test($(this).text()))
							return this;
				}
			}).each(function(index) {
				var hasException = false;
				for (var i = exceptions.length - 1; i >= 0; i--) {
					if (new RegExp("(" + exceptions[i] + ")$", "gi").test($(this).text())) {
						hasException = true;
						break;
					}
				}
				if (!hasException) {
					$(this).parents(".mw-htmlform-flatlist-item").children("input").prop("checked", true);

					// Log changes.	
					if (log === true)
						logChanges($(this).text());
				}
			});
		}
		// On edit raw watchlist page
		else {
			var contentElement = document.getElementById("mw-input-wpTitles");
			var replaceFunc = function(match, p1, offset, string) {
				for (var i = exceptions.length - 1; i >= 0; i--)
					if (new RegExp("(" + exceptions[i] + ")$", "gi").test(p1))
						return p1;

					// Log changes.	
				if (log === true)
					logChanges(p1);

				return "";
			};
			for (var i = these.length - 1; i >= 0; i--) {
				contentElement.value = contentElement.value.replace(new RegExp("(^(?:" + these[i] + ")(?:.+)?)", 'gim'), replaceFunc);
			}
		}

		// Automatically clicks on save button.
		if (save === true)
			savePage();
	} else
		console.log("This function only works on watchlist special pages.");
}

/* Removes pages which are ended with given strings from your watchlist.
 * NOTE: If you want to search for a subpage, you have to add slash at the beginning of the string.
 *
 * Parameters:
 ** these      - A list of pages that we search for them.
 ** exceptions - A list of exceptions that won't be removed.
 ** save       - Whether save changes automatically or not.
 ** log        - Wether log changes or not.
 */
function removeEndsWith(these, exceptions, save, log) {
	these = (typeof these !== "undefined") ? clear_escape(these, false) : [];
	exceptions = (typeof exceptions !== "undefined") ? clear_escape(exceptions, false) : [];
	// Default value for save parameter is false.
	save = (typeof save === 'undefined') ? false : save;
	// Default value for log parameter is true.
	log = (typeof log === 'undefined') ? true : log;

	// Only works on watchlist special pages.
	if (currentURL.indexOf("ویژه:ویرایش_فهرست_پی\u200cگیری\u200cها") > -1) {
		// On edit watchlist page
		if (currentURL.indexOf("raw") == -1) {
			$(".mw-htmlform-flatlist-item a").filter(function(index) {
				if ($(this).attr("title") == $(this).text()) {
					for (var i = these.length - 1; i >= 0; i--) {
						if (new RegExp("(" + these[i] + ")$", "gi").test($(this).text()))
							return this;
					}
				}
			}).each(function(index) {
				var hasException = false;
				for (var i = exceptions.length - 1; i >= 0; i--) {
					if (new RegExp("^(" + exceptions[i] + ")", "gi").test($(this).text())) {
						hasException = true;
						break;
					}
				}
				if (!hasException) {
					$(this).parents(".mw-htmlform-flatlist-item").children("input").prop("checked", true);

					// Log changes.	
					if (log === true)
						logChanges($(this).text());
				}
			});
		}
		// On edit raw watchlist page
		else {
			var contentElement = document.getElementById("mw-input-wpTitles");
			var replaceFunc = function(match, p1, offset, string) {
				for (var i = exceptions.length - 1; i >= 0; i--)
					if (new RegExp("^(" + exceptions[i] + ")", "gi").test(p1))
						return p1;

					// Log changes.	
				if (log === true)
					logChanges(p1);

				return "";
			};
			for (var i = these.length - 1; i >= 0; i--) {
				contentElement.value = contentElement.value.replace(new RegExp("((?:.+)?(?:" + these[i] + ")$)", 'gim'), replaceFunc);
			}
		}

		// Automatically clicks on save button.
		if (save === true)
			savePage();
	} else
		console.log("This function only works on watchlist special pages.");
}