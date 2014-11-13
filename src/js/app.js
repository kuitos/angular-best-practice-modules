/**
 * @author kui.liu
 * @since 2014/11/13 上午11:17
 */
;
(function (angular, undefined) {
    "use strict";

    angular.module("app", ["app.router", "app.services", "app.directives", "app.filters", "app.http-handler", "app.utils"])

        // 初始化app信息，绑定一些基础工具
        .run(["app", "$timeout", function (app, $timeout) {

            app.fileRoot = "/src/";

            /** 绑定timeout服务 */
            app.timeout = $timeout;

        }]);

})(window.angular);