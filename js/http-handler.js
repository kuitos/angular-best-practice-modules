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
                /** loading状态切换 */
                count = 0,
                loading = false,
                stopLoading = function () {
                    count = 0;
                    loading = false;
                    _app.loading(false); // end loading
                };

            /*************************** http超时时间设为30s ***************************/
            $httpProvider.defaults.timeout = 30 * 1000;
            /* 广告时间哈哈.... */
            $httpProvider.defaults.headers.common["X-Requested-With"] = "https://github.com/kuitos";

            /************************* 根据http请求状态判断是否需要loading图标 *************************/
            $httpProvider.defaults.transformRequest.push(function (data) {  // global loading start
                count += 1;
                if (!loading) {
                    _app.timeout(function () {
                        if (!loading && count > 0) {
                            loading = true;
                            _app.loading(true);
                        }
                    }, 500); // if no response in 500ms, begin loading
                }
                return data;
            });
            $httpProvider.defaults.transformResponse.push(function (data) { // global loading end
                count -= 1;
                if (loading && count === 0) {
                    stopLoading();
                }
                return data;
            });

            /******************** http拦截器，用于统一处理错误信息、消息缓存、响应结果处理等 **********************/
            $httpProvider.interceptors.push(["$q", "$log", function ($q, $log) {

                return {

                    response: function (res) {
                        var config = res.config,
                            responseBody = res.data,
                            cache;

                        if (angular.isObject(responseBody) && !responseBody.success) {

                            $log.error("%s 接口请求错误：%s", config.url, responseBody.message);
                            return $q.reject(res);

                        } else {

                            // 自定义配置，用于query请求直接返回data部分
                            if (config.useDataDirect) {
                                res.data = responseBody.data;
                            }

                            // 自定义配置，若该请求成功后需要重新刷新cache(save,update,delete等操作)，则清空对应cache。angular默认cache为$http
                            if (config.refreshCache) {
                                cache = angular.isObject(config.cache) ? config.cache : _app.cacheFactory.get("$http");
                                cache.removeAll();
                            }

                            return res;
                        }
                    },

                    responseError: function (res) {
                        $log.error("%s 接口响应失败! 状态：%s 错误信息：%s", res.config.url, res.status, res.statusText);
                        return $q.reject(res);
                    }
                }

            }]);

        }])

        .run(["$rootScope", "$timeout", "$cacheFactory", function ($rootScope, $timeout, $cacheFactory) {

            /** 绑定timeout服务 */
            _app.timeout = $timeout;

            /** loading状态切换 **/
            _app.loading = function (flag) {
                $rootScope.loading = flag;
            };

            /** 绑定cache服务 **/
            _app.cacheFactory = $cacheFactory;

        }]);

})(window.angular);
