/*** THINK OF THE CHILDREN ***/

// various variables - throw 'em into an object for convenience
// totc -> think of the children, yeah!
var totc = {};
totc.cssClass = 'hide-unpublished';
totc.localKey = 'umbTOTC';

// can we store a variable locally for return visits?
totc.checkForLocalStorage = function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
totc.hasLocal = totc.checkForLocalStorage();

// store it
totc.addToLocalStore = function(v) {
    if (totc.hasLocal) {
        localStorage[totc.localKey] = v;
    }
}

// fetch it
totc.getFromLocalStore = function() {
    if (totc.hasLocal) {
        return localStorage.getItem(totc.localKey) === 'true';
    }
}

// saves repeating the class add call
totc.addClass = function() {
    document.getElementById('mainwrapper').classList.add('hide-unpublished');
}


// the factory. 
// when the context menu opens, we'll grab the correct menu node and update its text
// we'll also ensure the unpublished nodes are displayed or hidden
// finally, we listen for clicks on the menu item and toggle its text as appropriate
angular.module('umbraco').factory('thinkofthechildren', function (appState, eventsService, treeService, editorState, angularHelper) {

    var totcFactory = {},
        currentSection;

    totcFactory.init = function () {
        eventsService.on('appState.sectionState.changed', function (e, args) {
                currentSection = args.value;            
        });

        totcFactory.listenForMenuStateChange();
    }

    totcFactory.listenForMenuStateChange = function () {

        if (currentSection === 'content') {
            var hideName = 'Hide unpublished nodes', showName = 'Show unpublished nodes';

            eventsService.on('appState.menuState.changed', function (e, args) {

                // bool
                var hideUnpublished = totc.getFromLocalStore();

                // user has opened the context menu, find the correct menu item and update the text
                if (args.key === 'menuActions' && args.value.length) {

                    // find the show/hide menu action
                    var menuItem = $.grep(args.value, function (el) {
                        return el.alias === 'thinkOfTheChildren';
                    })[0];

                    // check localstore value to set initial text and ensure children are hidden if true
                    if (hideUnpublished) {
                        totc.addClass();
                        menuItem.name = showName;
                    }
                    else {
                        menuItem.name = hideName;
                    }

                    // add click handler to contextmenu links - needs to be in here
                    // as it's dependent on the existence of the menuItem
                    angular.element('#contextMenu').on('click', 'a', function (e) {
                        if (menuItem.name === showName) {
                            menuItem.name = hideName;
                        }
                        else {
                            menuItem.name = showName;
                        }
                    });

                    // when the menu is loaded, check for show/hide value and add class if needed
                } else if (args.key === 'currentNode') {
                    if (hideUnpublished) {
                        totc.addClass();
                    }
                }
            });
        }
    }

    return totcFactory
});

// grabs the #mainwrapper element, toggles the class, updates localstorage if available
function totc_toggleUnpublished() {

    var rootNode = document.getElementById('mainwrapper'),
        className = rootNode.className;

    rootNode.classList.toggle(totc.cssClass);

    if (totc.hasLocal) {
        totc.addToLocalStore(rootNode.classList.contains(totc.cssClass));
    }
}

$(window).load(    

    function () {

        // check for the initial state for unpublished nodes
        if (totc.getFromLocalStore()) {
            totc.addClass();
        }

        // once the main view is loaded, inject the service
        angular.element('#umbracoMainPageBody').scope().$on('$viewContentLoaded', function () {

            var injector = angular.element('#umbracoMainPageBody').injector(),
                thinkofthechildren = injector.get('thinkofthechildren');

            thinkofthechildren.init(injector);
        });
    }
);