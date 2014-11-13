##Angular Best Practice Advices

###项目构建要点
    
    1.原则上禁止引入JQuery，只有当依赖的UI插件依赖于JQuery才引入。controller中禁止出现dom操作的代码，dom操作只允许出现在directive中。
    
    2.模块化。即service、directive、filter、route等均为单一模块，主页面采用依赖注入的方式引用。原则上各模板需保持中立，不允许出现相互依赖的情况。
      如directive不能依赖于service中某个服务，模块内部依赖内部解决，实现模块间解耦。
      
    3.目录结构。取决于项目大小。中小型项目建议采用本项目目录结构。大型较复杂项目采用 按功能模块 目录区分的方式。每个功能模块维护自己的
      controller、service、directive等。项目包含一个入口页面index.html,一个入口模块app.js.
    
    4.采用bower、gulp等工具管理项目，requireJs按需所取。相对于grunt强烈建议gulp。
    
###代码编写要点

    1.controller:
        
        1.按功能模块划分controller，不要写一个God Controller，即一个controller做完所有事情。按功能区划分出不同controller。如一个带弹出框的页面，
        页面一个controller，dialog一个controller。
        2.scope不是百宝箱更不是垃圾箱。scope上只允许绑定跟页面有交互的数据跟方法，与页面无直接交互的不要绑定到scope上。
        3.controller之间采用事件进行通信，数据通过service共享，不要依赖于父子scope之间的继承关系。
        
    2.service:
        
        1.service设计时要考虑该服务是否可配置。可配置服务使用provider构建，普通service统一使用factory构建。禁止使用.service()方式构建服务。
        
    3.directive:
        
        1.directive在设计上需保证其scope的独立性。不要再directive中干扰上层数据。即directive配置中 scope:{}
        2.directive需在一个结构固定的模板上根据数据动态展示。不要在link函数中根据数据动态生成或改变dom，确保dom操作的透明。原则就是，一切dom操作都由
          框架完成，我们关注的只有业务和数据。建议每个directive都由一个templateUrl(template)。
        3.在引入第三方ui组件之前请仔细考虑如果自己实现的代价有多大。通常轻量级的组件都可以自己去实现，不建议过多的依赖于第三方插件，尤其是用jquery实现的。
          总之，在引入第三方插件之前，请慎重考虑。
          
    4.其他:
        参考：https://github.com/kuitos/angular-seed readme
     
###MIT