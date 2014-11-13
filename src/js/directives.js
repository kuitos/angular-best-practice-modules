/**
 * @author kui.liu
 * @since 2014/10/09 上午10:21
 */
;
(function (angular) {
    "use strict";

    angular.module("common.directives", ["ui.bootstrap"])

    /**
     * 指令的要点是尽量保证scope隔离，也就是 scope:{}
     */
        .directive("", ["$compile", function () {

            return {
                restrict: "A",
                scope   : {},
                link    : function () {

                }
            }

        }])

})(window.angular);
