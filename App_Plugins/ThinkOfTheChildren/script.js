var hasLocal = checkForLocalStorage(),
    localKey = 'umbHideUnpublished';

function toggleUnpublished() {

    var $rootNode = $('#mainwrapper');
    
    $rootNode.toggleClass('hide-unpublished');
    
    if (hasLocal) {
        addToLocalStore($rootNode.hasClass('hide-unpublished'));
    }
}

function checkForLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function addToLocalStore(v) {
    if (hasLocal) {
        localStorage[localKey] = v;
    }
}

function getFromLocalStore() {
    if (hasLocal) {
        return localStorage.getItem(localKey) === 'true';
    }
}

function checkState() {
    return $('#mainwrapper').hasClass('hide-unpublished');
}


/* THINK OF THE CHILDREN!!! */

var umbraco = angular.module('umbraco');
umbraco.factory('hideunpublished', function (appState, eventsService, treeService, editorState, angularHelper) {

    return {
        init: function (scope) {

            var hideName = 'Hide unpublished nodes', showName = 'Show unpublished nodes';

            eventsService.on('appState.menuState.changed', function (e, args) {

                // bool
                var hideUnpublished = getFromLocalStore();

                // user has opened the context menu, find the correct menu item and update the text
                if (args.key === 'menuActions' && args.value.length) {

                    // find the show/hide menu action
                    var menuItem = $.grep(args.value, function (el) {
                        return el.alias === 'toggleUnpublished';
                    })[0];

                    // check localstore value to set initial text and ensure children are hidden if true
                    if (hideUnpublished) {
                        $('#mainwrapper').addClass('hide-unpublished');
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
                        $('#mainwrapper').addClass('hide-unpublished');
                    }
                }
            });
        }
    }
});

$(window).load(    

    function () {

        if (getFromLocalStore()) {
            $('#mainwrapper').addClass('hide-unpublished');
        }

        angular.element('#umbracoMainPageBody').scope().$on('$viewContentLoaded', function () {

            var injector = angular.element('#umbracoMainPageBody').injector();
            var hideUnpublished = injector.get('hideunpublished');
            hideUnpublished.init(injector);
        });
    }
);