/**
 * @author kui.liu
 * @since 2014/11/13 上午11:26
 */
;
(function (angular, undefined) {
    "use strict";

    angular.module("app.router", ["ngRoute"])

        // 无缓存获取文件
        .provider("getFile", ["app", function (app) {
            this.html = function (fileName) {
                return app.fileRoot + "tpl/" + fileName + '?v=' + app.version;
            };
            this.$get = function () {
                return {
                    html: this.html
                };
            };
        }])

        .config(['$routeProvider', '$locationProvider', 'getFileProvider',

            function ($routeProvider, $locationProvider, getFileProvider) {

                var
                    dashboard = {
                        templateUrl: getFileProvider.html('dashboard.html'),
                        controller : 'AppCtrl'
                    };

                $routeProvider.
                    when('/', dashboard).
                    when('/dashboard', dashboard).
                    otherwise({
                        redirectTo: '/'
                    });
            }
        ]);

})(window.angular);