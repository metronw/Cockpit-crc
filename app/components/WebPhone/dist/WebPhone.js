"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var jssip_1 = require("jssip");
// import RTCSession from 'jssip/lib/RTCSession';
var swr_1 = require("swr");
var react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
var fi_1 = require("react-icons/fi");
var navigation_1 = require("next/navigation");
var providers_1 = require("@/app/agent/providers");
jssip_1["default"].debug.enable('');
var fetcher = function (url) { return fetch(url).then(function (res) { return res.json(); }); };
// interface RTCSessionFailedEvent {
//   // Add relevant properties if needed
// }
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
    var router = navigation_1.useRouter();
    var _p = providers_1.useTicketContext(), ticketContext = _p.ticketContext, setTicketContext = _p.setTicketContext;
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
            console.log('Conectado ao servidor SIP');
        });
        uaRef.current.on('registrationFailed', function (e) {
            console.error('Falha no registro:', e.cause);
        });
        // @ts-expect-error: fix later
        uaRef.current.on('newRTCSession', function (_a) {
            var _b;
            var session = _a.session;
            var newSession = session;
            setSession(newSession);
            if (newSession.direction === 'incoming') {
                setCallerName(newSession.remote_identity.display_name || 'Desconhecido');
                setCallerNumber(newSession.remote_identity.uri.user || 'Desconhecido');
                callStatus === 'Incoming Call' && ((_b = answerAudioRef.current) === null || _b === void 0 ? void 0 : _b.play());
                setCallStatus('Incoming Call');
                onCallStatusChange('Incoming Call');
                console.log("User autoanswer " + userData.auto_answer);
                if (!userData.auto_answer) {
                    setIncomingCall(newSession);
                    if (ringAudioRef.current) {
                        ringAudioRef.current.loop = true;
                        ringAudioRef.current.play();
                    }
                }
                else {
                    if (ringAudioRef.current) {
                        ringAudioRef.current.play();
                        setTimeout(function () {
                            var _a;
                            (_a = ringAudioRef.current) === null || _a === void 0 ? void 0 : _a.pause();
                            if (ringAudioRef.current) {
                                ringAudioRef.current.currentTime = 0;
                            }
                            // @ts-expect-error: fix later
                            newSession.answer({ mediaStream: localStreamRef.current });
                            setupPeerConnection(newSession);
                            // Extrair trunk_name e callid no auto-answer
                            var displayName = newSession.remote_identity.display_name;
                            console.log("Display Name Auto-Answer:", displayName); // Adicionado log
                            var regex = /^\s*(\S+)\s*\{\s*([^}]+)\s*\}/;
                            var match = displayName.match(regex);
                            console.log("Regex Match Auto-Answer:", match); // Adicionado log
                            if (match) {
                                var trunk_name = match[1];
                                var callid = match[2];
                                var callernum = newSession.remote_identity.uri.user;
                                // Chamar a função para criar o ticket
                                createTicket(trunk_name, callid, callernum);
                            }
                            else {
                                console.warn("Regex não correspondeu para Auto-Answer. Display Name:", displayName);
                            }
                        }, 3000);
                    }
                }
            }
            if (newSession.direction === 'outgoing') {
                setCallerName(newSession.remote_identity.display_name || 'Desconhecido');
                setCallerNumber(newSession.remote_identity.uri.user || 'Desconhecido');
            }
            // @ts-expect-error: fix later
            newSession.on('ended', function (e) {
                setCallStatus('Call Ended');
                setSession(null);
                setIncomingCall(null);
                setCallerName('');
                setCallerNumber('');
                releaseStream();
                react_toastify_1.toast.info('Chamada encerrada por: ' + (e.originator === 'local' ? 'Local' : 'Remoto'));
            });
            newSession.on('failed', function () {
                setCallStatus('Call Failed');
                setSession(null);
                setIncomingCall(null);
                setCallerName('');
                setCallerNumber('');
                react_toastify_1.toast.error('Chamada falhou.');
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
                console.log('Dados de áudio carregados.');
            };
            remoteAudioRef.current.onplay = function () {
                console.log('Reprodução de áudio iniciada.');
            };
            remoteAudioRef.current.onerror = function (e) {
                console.error('Erro no elemento de áudio:', e);
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
                    console.error('Erro ao obter permissão de áudio:', error_1);
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
                    // @ts-expect-error: fix later
                    setupPeerConnection(call);
                    call.on('ended', function (e) {
                        react_toastify_1.toast.info('Chamada encerrada por:' + (e.originator === 'local' ? 'Local' : 'Remoto'));
                        setIsCalling(false);
                        stream_1.getTracks().forEach(function (track) { return track.stop(); });
                        localStreamRef.current = null;
                    });
                    call.on('failed', function () {
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
                        console.log('Estado da conexão:', pc.connectionState);
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
                    // @ts-expect-error: fix later
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
                    console.error('Erro ao obter permissão de áudio:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Função para criar ticket
    var createTicket = function (trunk_name, callid, callernum) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, ticket, newTickets, errorData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("createTicket chamada com trunk_name: " + trunk_name + ", callid: " + callid); // Adicionado log
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/phone/ticket', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ trunk_name: trunk_name, callid: callid, callernum: callernum })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log("Resposta da criação do ticket:", data); // Adicionado log
                    ticket = data.ticket;
                    newTickets = __spreadArrays(ticketContext.tickets, [ticket]);
                    setTicketContext(__assign(__assign({}, ticketContext), { tickets: newTickets }));
                    react_toastify_1.toast.success('Ticket criado com sucesso.');
                    router.push("/agent/triage/" + ticket.id);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    errorData = _a.sent();
                    console.error("Erro na resposta da criação do ticket:", errorData); // Adicionado log
                    throw new Error(errorData.message || 'Falha ao criar o ticket.');
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_4 = _a.sent();
                    console.error('Erro ao criar ticket:', error_4);
                    react_toastify_1.toast.error('Falha ao criar o ticket.');
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleAnswerCall = function () { return __awaiter(void 0, void 0, void 0, function () {
        var options, displayName, regex, match, trunk_name, callid, callernum;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Handle Answer Call invoked", incomingCall); // Adicionado log
                    if (!incomingCall) return [3 /*break*/, 4];
                    (_a = ringAudioRef.current) === null || _a === void 0 ? void 0 : _a.pause();
                    options = {
                        mediaConstraints: { audio: true, video: false },
                        mediaStream: localStreamRef.current
                    };
                    // @ts-expect-error: fix later
                    incomingCall.answer(options);
                    setupPeerConnection(incomingCall);
                    setIncomingCall(null);
                    setCallStatus('Connected');
                    onCallStatusChange('Connected');
                    displayName = incomingCall.remote_identity.display_name;
                    console.log("Display Name Manual Answer:", displayName); // Adicionado log
                    regex = /^\s*(\S+)\s*\{\s*([^}]+)\s*\}/;
                    match = displayName.match(regex);
                    console.log("Regex Match Manual Answer:", match); // Adicionado log
                    if (!match) return [3 /*break*/, 2];
                    trunk_name = match[1];
                    callid = match[2];
                    callernum = incomingCall.remote_identity.uri.user;
                    // Chamar a função para criar o ticket
                    return [4 /*yield*/, createTicket(trunk_name, callid, callernum)];
                case 1:
                    // Chamar a função para criar o ticket
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    console.warn("Regex não correspondeu para Answer Manual. Display Name:", displayName);
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    console.warn("incomingCall está nulo.");
                    _b.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); };
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
            react_toastify_1.toast.info("DTMF " + digit + " enviado.");
        }
        else {
            react_toastify_1.toast.error('Nenhuma chamada ativa para enviar DTMF.');
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
    return (react_1["default"].createElement("div", { style: {
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            maxWidth: '400px',
            margin: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        } }, isReady && (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("h3", { style: { color: '#333', marginBottom: '15px' } }, "WebRTC SIP Phone"),
        react_1["default"].createElement("div", { style: { marginBottom: '15px' } },
            react_1["default"].createElement("label", { style: { marginRight: '10px', color: '#333' } },
                "Prefixo:",
                react_1["default"].createElement("select", { value: selectedPrefix, onChange: function (e) { return setSelectedPrefix(e.target.value); }, style: {
                        marginLeft: '5px',
                        padding: '5px',
                        borderRadius: '4px',
                        borderColor: '#ccc',
                        color: '#333'
                    } }, prefixOptions.map(function (prefix) { return (react_1["default"].createElement("option", { key: prefix.number, value: prefix.number },
                    prefix.name,
                    " (",
                    prefix.number,
                    ")")); }))),
            react_1["default"].createElement("label", { style: { marginRight: '10px', color: '#333' } },
                "N\u00FAmero:",
                react_1["default"].createElement("input", { type: "text", value: numberToCall, onChange: function (e) { return setNumberToCall(e.target.value); }, style: {
                        marginLeft: '5px',
                        padding: '5px',
                        borderRadius: '4px',
                        borderColor: '#ccc',
                        color: '#333'
                    } }))),
        react_1["default"].createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
            } },
            react_1["default"].createElement("button", { onClick: handleCall, disabled: isCalling, className: "call-button " + (isCalling ? 'disabled' : ''), title: "Iniciar Chamada", "data-tooltip-id": "callTooltip" },
                react_1["default"].createElement(fi_1.FiPhoneCall, { size: 20 })),
            callStatus === 'Connected' && session && (react_1["default"].createElement("button", { onClick: function () {
                    session.terminate();
                    setSession(null);
                    setCallStatus('Call Ended');
                }, className: "hangup-button", title: "Encerrar Chamada", "data-tooltip-id": "hangUpTooltip" },
                react_1["default"].createElement(fi_1.FiPhoneOff, { size: 20 })))),
        isCalling && (react_1["default"].createElement("div", { style: { marginBottom: '15px' } },
            react_1["default"].createElement("h4", null, "Enviar DTMF:"),
            react_1["default"].createElement("div", null, ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map(function (digit) { return (react_1["default"].createElement("button", { key: digit, onClick: function () { return sendDTMF(digit); }, style: {
                    margin: '5px',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: '#333',
                    color: 'white'
                } }, digit)); })))),
        callStatus === 'Incoming Call' && incomingCall && (react_1["default"].createElement("div", { style: { marginBottom: '15px' } },
            react_1["default"].createElement("p", { style: { color: 'black' } },
                react_1["default"].createElement("strong", null, "Chamada de:"),
                " ",
                callerName,
                " (",
                callerNumber,
                ")"),
            react_1["default"].createElement("button", { onClick: handleAnswerCall, style: {
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: '#4caf50',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginRight: '10px'
                } }, "Atender"),
            react_1["default"].createElement("button", { onClick: handleRejectCall, style: {
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: '#f44336',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px'
                } }, "Recusar"))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("strong", null, "Status:"),
            " ",
            callStatus),
        react_1["default"].createElement("audio", { ref: ringAudioRef, src: "/audio/ringtone.wav" }),
        react_1["default"].createElement("audio", { ref: answerAudioRef, src: "/audio/answer.wav" }),
        react_1["default"].createElement("audio", { ref: dialtoneAudioRef, src: "/audio/dialtone.wav" }),
        react_1["default"].createElement("audio", { ref: hangupAudioRef, src: "/audio/hangup.wav" }),
        react_1["default"].createElement("audio", { ref: remoteAudioRef, autoPlay: true, controls: true, hidden: true })))));
});
WebPhone.displayName = "WebPhone";
exports["default"] = WebPhone;
