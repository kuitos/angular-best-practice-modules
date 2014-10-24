/**
 * @author kui.liu
 * @since 2014/10/09 上午10:22
 */
;
(function (window, angular, undefined) {
    "use strict";

    var ObjectUtils = {

            /**
             * 获取对象所有自有的可枚举属性
             * @returns {Array}
             */
            values: function (object) {
                var key, values = [];

                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        values.push(object[key]);
                    }
                }

                return values;
            }

        },

    /* ***************************web util*************************** */
        WebUtils = {

            buildURL: function (url) {
                var queryStrings = [],
                    property,
                    objArr = Array.prototype.slice.call(arguments, 1);
                objArr.forEach(function (element) {
                    for (property in element) {
                        if (element.hasOwnProperty(property)) {
                            queryStrings.push(property + "=" + element[property]);
                        }
                    }
                });
                return url + "?" + queryStrings.join("&");
            }
        };

    angular.module("common.utils", [])

        .value("utils", {

            ObjectUtils: ObjectUtils,
            WebUtils   : WebUtils,
            FloatTip   : window.FloatTip

        });

})(window, window.angular);
