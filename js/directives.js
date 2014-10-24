/**
 * @author kui.liu
 * @since 2014/10/09 上午10:21
 */
;
(function (angular) {
    "use strict";

    angular.module("common.directives", ["ui.bootstrap"])

        // 通用校验指令
        .directive('uiValidate', function () {

            return {
                restrict: 'A',
                require : 'ngModel',
                link    : function (scope, elm, attrs, ctrl) {
                    var validateFn, validators = {},
                        validateExpr = scope.$eval(attrs.uiValidate);

                    if (!validateExpr) {
                        return;
                    }

                    if (angular.isString(validateExpr)) {
                        validateExpr = { validator: validateExpr };
                    }

                    angular.forEach(validateExpr, function (exprssn, key) {
                        validateFn = function (valueToValidate) {
                            var expression = scope.$eval(exprssn, { '$value': valueToValidate });
                            if (angular.isObject(expression) && angular.isFunction(expression.then)) {
                                // expression is a promise
                                expression.then(function () {
                                    ctrl.$setValidity(key, true);
                                }, function () {
                                    ctrl.$setValidity(key, false);
                                });
                                return valueToValidate;
                            } else if (expression) {
                                // expression is true
                                ctrl.$setValidity(key, true);
                                return valueToValidate;
                            } else {
                                // expression is false
                                ctrl.$setValidity(key, false);
                                return valueToValidate;
                            }
                        };
                        validators[key] = validateFn;
                        ctrl.$formatters.push(validateFn);
                        ctrl.$parsers.push(validateFn);
                    });

                    function apply_watch(watch) {
                        //string - update all validators on expression change
                        if (angular.isString(watch)) {
                            scope.$watch(watch, function () {
                                angular.forEach(validators, function (validatorFn) {
                                    validatorFn(ctrl.$modelValue);
                                });
                            });
                            return;
                        }

                        //array - update all validators on change of any expression
                        if (angular.isArray(watch)) {
                            angular.forEach(watch, function (expression) {
                                scope.$watch(expression, function () {
                                    angular.forEach(validators, function (validatorFn) {
                                        validatorFn(ctrl.$modelValue);
                                    });
                                });
                            });
                            return;
                        }

                        //object - update appropriate validator
                        if (angular.isObject(watch)) {
                            angular.forEach(watch, function (expression, validatorKey) {
                                //value is string - look after one expression
                                if (angular.isString(expression)) {
                                    scope.$watch(expression, function () {
                                        validators[validatorKey](ctrl.$modelValue);
                                    });
                                }

                                //value is array - look after all expressions in array
                                if (angular.isArray(expression)) {
                                    angular.forEach(expression, function (intExpression) {
                                        scope.$watch(intExpression, function () {
                                            validators[validatorKey](ctrl.$modelValue);
                                        });
                                    });
                                }
                            });
                        }
                    }

                    // Support for ui-validate-watch
                    if (attrs.uiValidateWatch) {
                        apply_watch(scope.$eval(attrs.uiValidateWatch));
                    }
                }
            };
        })

        // 生成校验提示结果
        .directive('genTooltip', ["$timeout", "$compile", "$position", "isVisible", function ($timeout, $compile, $position, isVisible) {
            var toolTipTemplate = '<div class="tooltip right fade" style="display: block;"><div class="tooltip-arrow" style="border-right-color: #d9534f;"></div><div class="tooltip-inner" style="background-color: #d9534f;"></div></div>';

            return {
                require: '?ngModel',
                link   : function (scope, element, attr, ngModel) {

                    var enable = false,
                        options = scope.$eval(attr.genTooltip) || {},
                        tooltipElement,
                        tooltipInnerElement,
                        ttPosition,
                        placement = 'right',

                        showTooltip = function (show, title) {
                            if (show) {
                                if (!tooltipElement) {
                                    tooltipElement = angular.element(toolTipTemplate);
                                    element.after(tooltipElement);
                                    ttPosition = $position.positionElements(element, tooltipElement, placement);
                                    tooltipElement.css("top", ttPosition.top - 9 + "px");
                                    tooltipElement.css("left", ttPosition.left + "px");

                                    if (!tooltipInnerElement) {
                                        tooltipInnerElement = angular.element(tooltipElement.find('div')[1]);
                                    }
                                }

                                if (title != tooltipInnerElement.text()) {
                                    tooltipInnerElement.text(title);
                                }
                                tooltipElement.addClass("in");
                            } else {
                                if (tooltipElement) {
                                    tooltipElement.removeClass("in");
                                }
                            }
                        },

                        invalidMsg = function (invalid) {
                            ngModel.validate = enable && options.validate && isVisible(element);
                            if (ngModel.validate) {
                                var title = attr.showTitle && (ngModel.$name && ngModel.$name + ' ') || '';
                                var msg = scope.$eval(attr.tooltipMsg) || {};
                                if (invalid && options.validateMsg) {
                                    angular.forEach(ngModel.$error, function (value, key) {
                                        // angular.extend(options.validateMsg, msg)
                                        if (attr.msg[key]) {
                                            title += (value && msg[key] && msg[key] + ', ') || '';
                                        } else if (options.validateMsg[key]) {
                                            title += (value && options.validateMsg[key] && options.validateMsg[key] + ', ') || '';
                                        }
                                    });
                                }
                                title = title.slice(0, -2) || '';
                                showTooltip(!!invalid, title);
                            } else {
                                showTooltip(false, '');
                            }
                        },

                        validateFn = function (value) {
                            $timeout(function () {
                                invalidMsg(ngModel.$invalid);
                            });
                            return value;
                        };

                    attr.msg = scope.$eval(attr.tooltipMsg) || {};

                    // use for AngularJS validation
                    if (options.validate) {
                        options.trigger = 'manual';
                        options.placement = attr.placement || options.placement || 'right';
                        if (ngModel) {
                            ngModel.$formatters.push(validateFn);
                            ngModel.$parsers.push(validateFn);
                        } else {
                            scope.$watch(function () {
                                return attr.dataOriginalTitle || attr.originalTitle;
                            }, showTooltip);
                        }
                        element.bind('focus', function () {
                            // 开启校验
                            if (!enable) {
                                enable = true;
                            }
                            // 执行校验
                            validateFn();
                        });
                        scope.$on('genTooltipValidate', function (event, collect, turnoff) {
                            enable = !turnoff;
                            if (ngModel) {
                                if (angular.isArray(collect)) {
                                    collect.push(ngModel);
                                }
                                invalidMsg(ngModel.$invalid);
                            }
                        });
                    }
                }
            }
        }])

        // ngPattern监听器，用于监听ngPattern改变从而重新校验数据
        .directive("patternWatcher", function () {
            return {
                restrict: "A",
                require : "^ngModel",
                link    : function (scope, element, attr, ngModel) {

                    if (attr.hasOwnProperty("ngPattern")) {
                        scope.$watch(attr.ngPattern, function (newVal) {
                            if (newVal && ngModel.$viewValue) {
                                ngModel.$setValidity("pattern", newVal.test(ngModel.$viewValue));
                            }
                        });
                    }
                }
            }
        })

        .directive("datePicker", ["$compile", function ($compile) {

            return {
                restrict: "E",
                require : "ngModel",
                scope   : {
                    maxDate: "=",
                    minDate: "=",
                    ngModel: "="
                },
                compile : function (element, attr) {

                    var tplElement = angular.element('<input class="set-date" datepicker-popup ng-model="ngModel" is-open="isOpen" max-date="maxDate" min-date="minDate" ng-focus="isOpen=true" ng-click="isOpen=true" type="text"/>');

                    if (!attr.maxDate) {
                        tplElement.removeAttr("max-date");
                    }
                    if (!attr.minDate) {
                        tplElement.removeAttr("min-date");
                    }

                    return function (scope, element) {
                        element.replaceWith(tplElement);
                        $compile(tplElement)(scope);
                    }
                }
            }
        }])

    /** ******************************* directives config ************************************** **/
        .config(["datepickerConfig", "datepickerPopupConfig", "paginationConfig", "$tooltipProvider", function (datepickerConfig, datepickerPopupConfig, paginationConfig, $tooltipProvider) {
            // 日期控件配置
            datepickerConfig.showWeeks = false;
            datepickerConfig.maxDate = new Date();
            datepickerPopupConfig.appendToBody = true;
            datepickerPopupConfig.currentText = "今天";
            datepickerPopupConfig.clearText = "重置";
            datepickerPopupConfig.closeText = "确定";
            // pagination配置
            paginationConfig.itemsPerPage = 15;
            paginationConfig.boundaryLinks = true;
            paginationConfig.firstText = "«";
            paginationConfig.previousText = "‹";
            paginationConfig.nextText = "›";
            paginationConfig.lastText = "»";
            // tooltip配置
            $tooltipProvider.options({
                placement: "right",
                trigger  : "mouseenter"
            });

        }]);

})(window.angular);
