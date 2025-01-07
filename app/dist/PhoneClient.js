"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var swr_1 = require("swr");
var WebPhone_1 = require("@/app/components/WebPhone/WebPhone");
var fetcher = function (url) { return fetch(url).then(function (res) { return res.json(); }); };
function PhoneClient() {
    var userPhone = swr_1["default"]('/api/phone/user', fetcher).data;
    var _a = react_1.useState(false), showPhone = _a[0], setShowPhone = _a[1];
    var _b = react_1.useState(''), callStatus = _b[0], setCallStatus = _b[1];
    var webPhoneRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (userPhone && !userPhone.error) {
            setShowPhone(true);
        }
        if (userPhone && userPhone.error) {
            console.error('Erro ao buscar dados do usuário:', userPhone.error);
            setShowPhone(false);
        }
        if (userPhone && userPhone.error === 'Usuário não está logado') {
            console.error('Usuário não está logado');
            setShowPhone(false);
        }
    }, [userPhone]);
    return (React.createElement("div", { style: {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
        } },
        React.createElement("button", { onClick: function () { return setShowPhone(!showPhone); }, style: {
                backgroundColor: showPhone ? "#f44336" : "#4caf50",
                color: "white",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                border: "none",
                cursor: "pointer",
                display: callStatus === 'Connected' ? 'none' : 'block'
            } }, showPhone ? "X" : "☎"),
        callStatus === 'Incoming Call' && (React.createElement("button", { onClick: function () { var _a; return (_a = webPhoneRef.current) === null || _a === void 0 ? void 0 : _a.handleAnswerCall(); }, style: {
                backgroundColor: "#4caf50",
                color: "white",
                borderRadius: "5px",
                padding: "5px 10px",
                marginTop: "8px",
                cursor: "pointer"
            } }, "Atender")),
        React.createElement("div", { style: {
                marginTop: "8px",
                display: showPhone ? "block" : "none"
            } },
            React.createElement(WebPhone_1["default"], { ref: webPhoneRef, onCallStatusChange: setCallStatus }))));
}
exports["default"] = PhoneClient;
