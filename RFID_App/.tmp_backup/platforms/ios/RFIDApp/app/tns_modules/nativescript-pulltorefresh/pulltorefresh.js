"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("tns-core-modules/color");
var pulltorefresh_common_1 = require("./pulltorefresh-common");
__export(require("./pulltorefresh-common"));
var PullToRefreshHandler = (function (_super) {
    __extends(PullToRefreshHandler, _super);
    function PullToRefreshHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PullToRefreshHandler.initWithOnwer = function (owner) {
        var impl = PullToRefreshHandler.new();
        impl._owner = owner;
        return impl;
    };
    PullToRefreshHandler.prototype.handleRefresh = function (refreshControl) {
        var pullToRefresh = this._owner.get();
        pullToRefresh.refreshing = true;
        pullToRefresh.notify({
            eventName: pulltorefresh_common_1.PullToRefreshBase.refreshEvent,
            object: pullToRefresh
        });
    };
    PullToRefreshHandler.ObjCExposedMethods = {
        handleRefresh: { returns: interop.types.void, params: [UIRefreshControl] }
    };
    return PullToRefreshHandler;
}(NSObject));
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh() {
        var _this = _super.call(this) || this;
        _this.refreshControl = UIRefreshControl.alloc().init();
        _this._handler = PullToRefreshHandler.initWithOnwer(new WeakRef(_this));
        _this.refreshControl.addTargetActionForControlEvents(_this._handler, "handleRefresh", 4096);
        return _this;
    }
    PullToRefresh.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        if (this.content.ios instanceof UIScrollView) {
            this.content.ios.alwaysBounceVertical = true;
            this.content.ios.addSubview(this.refreshControl);
        }
        else if (this.content.ios instanceof UIWebView) {
            this.content.ios.scrollView.alwaysBounceVertical = true;
            this.content.ios.scrollView.addSubview(this.refreshControl);
        }
        else if (this.content.ios instanceof WKWebView) {
            this.content.ios.scrollView.alwaysBounceVertical = true;
            this.content.ios.scrollView.addSubview(this.refreshControl);
        }
        else {
            throw new Error("Content must inherit from either UIScrollView, UIWebView or WKWebView!");
        }
    };
    PullToRefresh.prototype[pulltorefresh_common_1.refreshingProperty.getDefault] = function () {
        return false;
    };
    PullToRefresh.prototype[pulltorefresh_common_1.refreshingProperty.setNative] = function (value) {
        if (value) {
            this.refreshControl.beginRefreshing();
        }
        else {
            this.refreshControl.endRefreshing();
        }
    };
    PullToRefresh.prototype[pulltorefresh_common_1.colorProperty.getDefault] = function () {
        return this.refreshControl.tintColor;
    };
    PullToRefresh.prototype[pulltorefresh_common_1.colorProperty.setNative] = function (value) {
        var color = value instanceof color_1.Color ? value.ios : value;
        this.refreshControl.tintColor = color;
    };
    PullToRefresh.prototype[pulltorefresh_common_1.backgroundColorProperty.getDefault] = function () {
        return this.refreshControl.backgroundColor;
    };
    PullToRefresh.prototype[pulltorefresh_common_1.backgroundColorProperty.setNative] = function (value) {
        var color = value instanceof color_1.Color ? value.ios : value;
        this.refreshControl.backgroundColor = color;
    };
    return PullToRefresh;
}(pulltorefresh_common_1.PullToRefreshBase));
exports.PullToRefresh = PullToRefresh;
//# sourceMappingURL=pulltorefresh.js.map