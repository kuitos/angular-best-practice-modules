/**
 * @author kui.liu
 * @since 2014/10/10 下午5:52
 * http处理器，用于设定全局http配置，包括loading状态切换，拦截器配置，超时时间配置等
 */
;
(function (angular, undefined) {
    "use strict";

    // 模拟service的私有服务
    var _app = {};

    angular.module("common.http-handler", [])

        .config(["$httpProvider", function ($httpProvider) {

            var
                /** http请求相关状态(loading,saving)切换 */
                count = 0,
                loading = false,
                saving = false,

                stopLoading = function () {
                    loading = false;
                    _app.isLoading(false); // end loading
                },
                stopSaving = function () {
                    saving = false;
                    _app.isSaving(false); // end saving
                };

            /*************************** http超时时间设为30s ***************************/
            $httpProvider.defaults.timeout = 30 * 1000;
            /*************************** 禁用浏览器缓存 ***************************/
            $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
            /* 广告时间哈哈.... */
            $httpProvider.defaults.headers.common["X-Requested-With"] = "https://github.com/kuitos";

            /******************** http拦截器，用于统一处理错误信息、消息缓存、请求响应状态、响应结果处理等 **********************/
            $httpProvider.interceptors.push(["$q", "$log", "$timeout", "$cacheFactory", "tipsHandler",
                function ($q, $log, $timeout, $cacheFactory, tipsHandler) {

                    return {

                        request: function (config) {

                            count++;
                            if (!loading) {

                                // saving start
                                if (config.saveStatus) {
                                    saving = true;
                                    _app.isSaving(true);
                                }

                                $timeout(function () {
                                    if (!loading && count > 0) {
                                        loading = true;
                                        _app.isLoading(true);
                                    }
                                }, 500); // if no response in 500ms, begin loading
                            }

                            return config;
                        },

                        requestError: function (rejection) {
                            $log.error("%s 接口请求失败!", rejection.url);
                            return $q.reject(rejection);
                        },

                        response: function (res) {
                            var config = res.config,
                                responseBody = res.data,
                                cache;

                            count--;
                            // 响应结束，清除相关状态
                            if (count === 0) {
                                stopSaving();
                                if (loading) {
                                    stopLoading();
                                }
                            }

                            if (angular.isObject(responseBody) && !responseBody.success) {

                                // 失败弹出错误提示信息
                                tipsHandler.error(responseBody.message);
                                $log.error("%s 接口请求错误：%s", config.url, responseBody.message);
                                return $q.reject(res);

                            } else {

                                // 自定义配置，用于query请求直接返回data部分
                                if (config.useDataDirect) {
                                    res.data = responseBody.data;
                                }

                                // 自定义配置，若该请求成功后需要重新刷新cache(save,update,delete等操作)，则清空对应cache。angular默认cache为$http
                                if (config.refreshCache) {
                                    cache = angular.isObject(config.cache) ? config.cache : $cacheFactory.get("$http");
                                    cache.removeAll();
                                }

                                // 关注保存状态则弹出成功提示
                                if (config.saveStatus) {
                                    tipsHandler.success(responseBody.message);
                                }

                                return res;
                            }
                        },

                        responseError: function (rejection) {
                            count--;
                            // 响应结束，清除相关状态
                            if (count === 0) {
                                stopSaving();
                                if (loading) {
                                    stopLoading();
                                }
                            }
                            // 失败弹出错误提示信息
                            tipsHandler.error("请求错误!");
                            $log.error("%s 接口响应失败! 状态：%s 错误信息：%s", rejection.config.url, rejection.status, rejection.statusText);
                            return $q.reject(rejection);
                        }
                    }
                }]);
        }])

        /* 提示信息provider，用于配置错误提示处理器 **/
        .provider("tipsHandler", function () {

            var _tipsHandler;

            this.setTipsHandler = function (tipsHandler) {

                _tipsHandler = angular.extend({

                    error  : angular.noop,
                    warning: angular.noop,
                    success: angular.noop

                }, tipsHandler);
            };

            this.error = function (message) {
                _tipsHandler.error(message);
            };

            this.warning = function (message) {
                _tipsHandler.error(message);
            };

            this.success = function (message) {
                _tipsHandler.success(message);
            };

            this.$get = function () {
                return {
                    error  : this.error,
                    warning: this.warning,
                    success: this.success
                }
            };

        })

        .run(["$rootScope", function ($rootScope) {

            /** loading状态切换 **/
            _app.isLoading = function (flag) {
                $rootScope.loading = flag;
            };

            _app.isSaving = function (flag) {
                $rootScope.saving = flag;
            };

        }]);

})(window.angular);