"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Header = void 0;
var Header;
(function (Header) {
    Header["Client"] = "MDPC01";
    Header["Worker"] = "MDPW01";
})(Header = exports.Header || (exports.Header = {}));
var Message;
(function (Message) {
    Message["Ready"] = "\u0001";
    Message["Request"] = "\u0002";
    Message["Reply"] = "\u0003";
    Message["Heartbeat"] = "\u0004";
    Message["Disconnect"] = "\u0005";
})(Message = exports.Message || (exports.Message = {}));
//# sourceMappingURL=types.js.map