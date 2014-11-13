/**
 * @author kui.liu
 * @since 2014/11/13 上午11:13
 */
;
(function () {
    "use strict";

    angular.module("app")

        .controller("AppCtrl", ["$scope", "app", function ($scope, app) {

            app
                /*-------------- scope上 绑定属性及成员方法 --------------**/
                .genMembers($scope, {

                })

                /*-------------- 绑定事件, 通过$scope.emitEvent(eventName)调用 --------------**/
                .bindEvents($scope, {
                    eventName: function () {

                    }

                })

                /*-------------- 启动方法 --------------**/
                .kickStart(function () {

                });

        }]);

})();