"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var jssip_1 = require("jssip");
var swr_1 = require("swr");
var react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
var fi_1 = require("react-icons/fi");
require("./WebPhone.css");
jssip_1["default"].debug.enable('');
var fetcher = function (url) { return fetch(url).then(function (res) { return res.json(); }); };
var WebPhone = react_1.forwardRef(function (_a, ref) {
    var onCallStatusChange = _a.onCallStatusChange;
    var _b = react_1.useState(null), session = _b[0], setSession = _b[1];
    var uaRef = react_1.useRef(null);
    var _c = react_1.useState('Idle'), callStatus = _c[0], setCallStatus = _c[1];
    var _d = react_1.useState(''), numberToCall = _d[0], setNumberToCall = _d[1];
    var _e = react_1.useState(''), selectedPrefix = _e[0], setSelectedPrefix = _e[1];
    var _f = react_1.useState([]), prefixOptions = _f[0], setPrefixOptions = _f[1];
    var _g = react_1.useState(false), isReady = _g[0], setIsReady = _g[1];
    var _h = react_1.useState(null), incomingCall = _h[0], setIncomingCall = _h[1];
    var _j = react_1.useState(false), isCalling = _j[0], setIsCalling = _j[1];
    var _k = react_1.useState(''), callerName = _k[0], setCallerName = _k[1];
    var _l = react_1.useState(''), callerNumber = _l[0], setCallerNumber = _l[1];
    var localStreamRef = react_1.useRef(null);
    var remoteAudioRef = react_1.useRef(null);
    var ringAudioRef = react_1.useRef(null);
    var answerAudioRef = react_1.useRef(null);
    var dialtoneAudioRef = react_1.useRef(null);
    var hangupAudioRef = react_1.useRef(null);
    var _m = swr_1["default"]('/api/phone/user', fetcher), userData = _m.data, userError = _m.error;
    var _o = swr_1["default"]('/api/phone/prefix', fetcher), prefixesData = _o.data, prefixesError = _o.error;
    react_1.useEffect(function () {
        if (!userData)
            return;
        if (!userData.error) {
            setIsReady(true);
        }
    }, [userData]);
    react_1.useEffect(function () {
        if (!userData || !isReady)
            return;
        var socket = new jssip_1["default"].WebSocketInterface(userData.sip_websocket);
        var configuration = {
            sockets: [socket],
            uri: "sip:" + userData.sip_extension + "@" + userData.sip_server,
            password: userData.sip_password,
            register: true
        };
        uaRef.current = new jssip_1["default"].UA(configuration);
        uaRef.current.start();
        uaRef.current.on('connected', function () {
            console.log('Connected to SIP server');
        });
        uaRef.current.on('registrationFailed', function (e) {
            console.error('Registration failed:', e.cause);
        });
        uaRef.current.on('newRTCSession', function (e) {
            var _a, _b;
            var newSession = e.session;
            setSession(newSession);
            if (newSession.direction === 'incoming') {
                var callerNameMatch = (_a = newSession.remote_identity.display_name) === null || _a === void 0 ? void 0 : _a.match(/^\s*(\S+)\s*\{/);
                setCallerName(callerNameMatch ? callerNameMatch[1] : 'Unknown');
                setCallerNumber(newSession.remote_identity.uri.user || 'Unknown');
                callStatus === 'Incoming Call' && ((_b = answerAudioRef.current) === null || _b === void 0 ? void 0 : _b.play());
                console.log("Asterisk Session Variables: ", newSession._request);
                setCallStatus('Incoming Call');
                onCallStatusChange('Incoming Call');
                if (userData.autoanswer === 0) {
                    setIncomingCall(newSession);
                    if (ringAudioRef.current) {
                        ringAudioRef.current.loop = true;
                        ringAudioRef.current.play();
                    }
                }
                else {
                    newSession.answer({ mediaStream: localStreamRef.current });
                    setupPeerConnection(newSession);
                }
            }
            if (newSession.direction === 'outgoing') {
                setCallerName(newSession.remote_identity.display_name || 'Unknown');
                setCallerNumber(newSession.remote_identity.uri.user || 'Unknown');
            }
            newSession.on('ended', function (e) {
                setCallStatus('Call Ended');
                setSession(null);
                setIncomingCall(null);
                setCallerName('');
                setCallerNumber('');
                releaseStream();
                react_toastify_1.toast.info('Call ended by: ' + (e.originator === 'local' ? 'Local' : 'Remote'));
            });
            newSession.on('failed', function (e) {
                setCallStatus('Call Failed');
                setSession(null);
                setIncomingCall(null);
                setCallerName('');
                setCallerNumber('');
                react_toastify_1.toast.error('Call failed.');
                releaseStream();
            });
        });
        return function () {
            var _a;
            (_a = uaRef.current) === null || _a === void 0 ? void 0 : _a.stop();
        };
    }, [userData, isReady]);
    react_1.useEffect(function () {
        if (prefixesData) {
            setPrefixOptions(prefixesData);
            if (prefixesData.length > 0) {
                setSelectedPrefix(prefixesData[0].number);
            }
        }
    }, [prefixesData]);
    react_1.useEffect(function () {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.onloadeddata = function () {
                console.log('Audio data loaded.');
            };
            remoteAudioRef.current.onplay = function () {
                console.log('Audio playback started.');
            };
            remoteAudioRef.current.onerror = function (e) {
                console.error('Audio element error:', e);
            };
        }
    }, [remoteAudioRef]);
    var getUserMediaStream = function () { return __awaiter(void 0, void 0, void 0, function () {
        var stream, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true, video: false })];
                case 1:
                    stream = _a.sent();
                    return [2 /*return*/, stream];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error obtaining audio permission:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var releaseStream = function () {
        var _a;
        [localStreamRef.current, (_a = remoteAudioRef.current) === null || _a === void 0 ? void 0 : _a.srcObject].forEach(function (stream) {
            if (stream) {
                stream.getTracks().forEach(function (track) { return track.stop(); });
            }
        });
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
    };
    var handleCall = function () { return __awaiter(void 0, void 0, void 0, function () {
        var target, stream_1, options, call, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!numberToCall || !uaRef.current || isCalling)
                        return [2 /*return*/];
                    setIsCalling(true);
                    target = "sip:" + selectedPrefix + numberToCall + "@aws-pbx.metronw.com.br";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getUserMediaStream()];
                case 2:
                    stream_1 = _a.sent();
                    localStreamRef.current = stream_1;
                    options = {
                        mediaConstraints: { audio: true, video: false },
                        mediaStream: stream_1
                    };
                    call = uaRef.current.call(target, options);
                    setupPeerConnection(call);
                    call.on('ended', function (e) {
                        react_toastify_1.toast.info('Call ended by:' + (e.originator === 'local' ? 'Local' : 'Remote'));
                        setIsCalling(false);
                        stream_1.getTracks().forEach(function (track) { return track.stop(); });
                        localStreamRef.current = null;
                    });
                    call.on('failed', function (e) {
                        setIsCalling(false);
                        stream_1.getTracks().forEach(function (track) { return track.stop(); });
                        localStreamRef.current = null;
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setIsCalling(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var setupPeerConnection = function (session) { return __awaiter(void 0, void 0, void 0, function () {
        var pc, stream_2, existingTracks, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pc = session.connection;
                    if (pc.connectionState === 'connecting' || pc.connectionState === 'connected') {
                        return [2 /*return*/];
                    }
                    pc.onconnectionstatechange = function () {
                        console.log('Connection state:', pc.connectionState);
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getUserMediaStream()];
                case 2:
                    stream_2 = _a.sent();
                    localStreamRef.current = stream_2;
                    existingTracks = pc.getSenders().map(function (sender) { return sender.track; });
                    if (existingTracks.length === 0) {
                        stream_2.getTracks().forEach(function (track) {
                            pc.addTrack(track, stream_2);
                        });
                    }
                    pc.getSenders().forEach(function (sender) {
                        if (sender.track && sender.track.kind === 'video') {
                            pc.removeTrack(sender);
                        }
                    });
                    pc.ontrack = function (event) {
                        var remoteStream = event.streams[0];
                        if (remoteStream && remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                        }
                    };
                    setCallStatus(session.direction === 'incoming' ? 'Incoming Call' : 'Calling');
                    session.on('ended', function () {
                        releaseStream();
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error obtaining audio permission:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleAnswerCall = function () {
        var _a;
        if (incomingCall) {
            (_a = ringAudioRef.current) === null || _a === void 0 ? void 0 : _a.pause();
            var options = {
                mediaConstraints: { audio: true, video: false },
                mediaStream: localStreamRef.current
            };
            incomingCall.answer(options);
            setupPeerConnection(incomingCall);
            setIncomingCall(null);
            setCallStatus('Connected');
            onCallStatusChange('Connected');
        }
    };
    var handleRejectCall = function () {
        var _a;
        if (incomingCall) {
            (_a = ringAudioRef.current) === null || _a === void 0 ? void 0 : _a.pause();
            incomingCall.terminate();
            setIncomingCall(null);
            setCallStatus('Call Ended');
            setCallerName('');
            setCallerNumber('');
        }
    };
    var sendDTMF = function (digit) {
        var _a;
        if (session && session.isEstablished()) {
            (_a = dialtoneAudioRef.current) === null || _a === void 0 ? void 0 : _a.play();
            session.sendDTMF(digit);
            react_toastify_1.toast.info("DTMF " + digit + " sent.");
        }
        else {
            react_toastify_1.toast.error('No active call to send DTMF.');
        }
    };
    react_1.useImperativeHandle(ref, function () { return ({
        handleAnswerCall: handleAnswerCall
    }); });
    react_1.useEffect(function () {
        onCallStatusChange(callStatus);
    }, [callStatus, onCallStatusChange]);
    if (userError || prefixesError)
        return react_1["default"].createElement("div", null, "Error loading data.");
    if (!userData || !prefixesData)
        return react_1["default"].createElement("div", null, "Loading...");
    return (react_1["default"].createElement("div", { className: "webphone-container" }, isReady && (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("h3", { className: "webphone-title" }, "WebRTC SIP Phone"),
        react_1["default"].createElement("div", { className: "webphone-input-group" },
            react_1["default"].createElement("label", { className: "webphone-label" },
                "Prefix:",
                react_1["default"].createElement("select", { value: selectedPrefix, onChange: function (e) { return setSelectedPrefix(e.target.value); }, className: "webphone-select" }, prefixOptions.map(function (prefix) { return (react_1["default"].createElement("option", { key: prefix.number, value: prefix.number },
                    prefix.name,
                    " (",
                    prefix.number,
                    ")")); }))),
            react_1["default"].createElement("label", { className: "webphone-label" },
                "Number:",
                react_1["default"].createElement("input", { type: "text", value: numberToCall, onChange: function (e) { return setNumberToCall(e.target.value); }, className: "webphone-input" }))),
        react_1["default"].createElement("div", { className: "webphone-button-group" },
            react_1["default"].createElement("button", { onClick: handleCall, disabled: isCalling, className: "call-button " + (isCalling ? 'disabled' : ''), title: "Start Call", "data-tooltip-id": "callTooltip" },
                react_1["default"].createElement(fi_1.FiPhoneCall, { size: 20 })),
            session && (react_1["default"].createElement("button", { onClick: function () {
                    session.terminate();
                    setSession(null);
                    setCallStatus('Call Ended');
                }, className: "hangup-button", title: "End Call", "data-tooltip-id": "hangUpTooltip" },
                react_1["default"].createElement(fi_1.FiPhoneOff, { size: 20 })))),
        isCalling && (react_1["default"].createElement("div", { className: "webphone-dtmf-group" },
            react_1["default"].createElement("h4", null, "Send DTMF:"),
            react_1["default"].createElement("div", null, ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map(function (digit) { return (react_1["default"].createElement("button", { key: digit, onClick: function () { return sendDTMF(digit); }, className: "dtmf-button" }, digit)); })))),
        (incomingCall || (session && callStatus !== 'Idle')) && (react_1["default"].createElement("div", { className: "webphone-call-info" },
            react_1["default"].createElement("p", null,
                react_1["default"].createElement("strong", null, "Call from:"),
                " ",
                callerName,
                " (",
                callerNumber,
                ")"),
            incomingCall && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("button", { onClick: handleAnswerCall, className: "answer-button" }, "Answer"),
                react_1["default"].createElement("button", { onClick: handleRejectCall, className: "reject-button" }, "Reject"))))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("strong", null, "Status:"),
            " ",
            callStatus),
        react_1["default"].createElement("audio", { ref: ringAudioRef, src: "/audio/ringtone.wav" }),
        react_1["default"].createElement("audio", { ref: answerAudioRef, src: "/audio/answer.wav" }),
        react_1["default"].createElement("audio", { ref: dialtoneAudioRef, src: "/audio/dialtone.wav" }),
        react_1["default"].createElement("audio", { ref: hangupAudioRef, src: "/audio/hangup.wav" }),
        react_1["default"].createElement("audio", { ref: remoteAudioRef, autoPlay: true, controls: true })))));
});
exports["default"] = WebPhone;
