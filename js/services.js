/**
 * @author kui.liu
 * @since 2014/10/09 上午10:18
 */
;
(function (angular) {
    "use strict";

    angular.module("common.services", ["ngResource", "ngCookies", "common.locale"])

        /* ******************************** constants & values ******************************** */
        // 定义app
        .constant("app", {
            version : Date.now(),
            fileRoot: window.ResourceDir,

            /**
             * 下面三个方法（genMembers,bindEvents,kickStart）用于划分scope代码块，不同区块代表不同逻辑，从而改善controller的表现形式
             */
            // 初始化scope成员
            genMembers: function (scope, members) {

                angular.forEach(members, function (value, key) {
                    scope[key] = value;
                });

                return this;
            },

            // 绑定事件处理器，避免$scope上绑定过多function， events：原始事件处理function集合
            bindEvents: function (scope, events) {
                scope.emitEvent = function (eventName) {
                    return events[eventName].apply(scope, Array.prototype.slice.call(arguments, 1));
                };

                return this;
            },

            // 入口函数
            kickStart : function (initFn) {
                initFn();
            }
        })

        /* ******************************** providers ******************************** */
        // 无缓存获取文件
        .provider("getFile", ["app", function (app) {
            this.html = function (fileName) {
                return app.fileRoot + "tpls/" + fileName + '?v=' + app.version;
            };
            this.$get = function () {
                return {
                    html: this.html
                };
            };
        }])

        /* ******************************** factories ******************************** */
        // 元素是否可见
        .factory('isVisible', function () {
            return function (element) {
                var rect = element[0].getBoundingClientRect();
                return Boolean(rect.bottom - rect.top);
            };
        })

        /* ******************************** services config ******************************** */
        .config(["$resourceProvider", function ($resourceProvider) {

            /** ***************** $resource配置 ****************** **/
            $resourceProvider.defaults.stripTrailingSlashes = false;  // 强制区分restful请求url的/分隔符
            // 重写query方法使其直接返回响应主体内容
            // 自定义配置(配合$http interceptor) useDataDirect:query操作直接使用data作为响应体   refreshCache:该操作后下次请求数据需要刷新cache
            $resourceProvider.defaults.actions = angular.extend({}, $resourceProvider.defaults.actions, {
                "get"   : {method: "GET", cache: true},
                "save"  : {method: "POST", refreshCache: true},
                "query" : {method: "GET", isArray: true, cache: true, useDataDirect: true},
                "remove": {method: "DELETE", refreshCache: true},
                "delete": {method: "DELETE", refreshCache: true}
            });
        }])

        /* ******************************** services init ******************************** */
        .run(["$rootScope", "$timeout", "$locale", "$cookies", "$resource", "app", function ($rootScope, $timeout, $locale, $cookies, $resource, app) {
            app.genResource = $resource;
            app.timeout = $timeout;
            app.cookies = $cookies;
            app.rootScope = $rootScope;

            /** 表单校验通用方法 **/
            app.validate = function (scope, turnoff) {
                var collect = [],
                    error = [];
                scope.$broadcast('genTooltipValidate', collect, turnoff);

                angular.forEach(collect, function (value) {
                    if (value.validate && value.$invalid) {
                        error.push(value);
                    }
                });

                if (error.length === 0) {
                    app.validate.errorList = null;
                    scope.$broadcast('genTooltipValidate', collect, true);
                } else {
                    app.validate.errorList = error;
                }
                return !app.validate.errorList;
            };

            /** rootScope全局初始化 **/
            $rootScope.validateTooltip = {
                validate   : true,
                validateMsg: $locale.VALIDATE
            };

        }]);

})(window.angular);
