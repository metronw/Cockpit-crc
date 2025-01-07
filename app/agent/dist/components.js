'use client';
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
exports.Sidebar = exports.AgentHeader = exports.PerformanceChart = void 0;
var recharts_1 = require("recharts");
var react_1 = require("@nextui-org/react");
var solid_1 = require("@heroicons/react/24/solid");
var navigation_1 = require("next/navigation");
var providers_1 = require("@/app/agent/providers");
var api_1 = require("@/app/actions/api");
var react_2 = require("react");
var react_3 = require("next-auth/react");
exports.PerformanceChart = function () {
    var data = [{ name: 'Dia 1', uv: 400, pv: 2400, amt: 2400 }, { name: 'Dia 2', uv: 200, pv: 3000, amt: 2400 }, { name: 'Dia 3', uv: 700, pv: 3000, amt: 2400 }];
    return (React.createElement(recharts_1.BarChart, { width: 600, height: 300, data: data, margin: { top: 5, right: 20, bottom: 5, left: 0 } },
        React.createElement(recharts_1.Bar, { dataKey: "uv", stroke: "#8884d8" }),
        React.createElement(recharts_1.XAxis, { dataKey: "name" }),
        React.createElement(recharts_1.YAxis, null),
        React.createElement(recharts_1.Tooltip, null)));
};
exports.AgentHeader = function (_a) {
    var _b, _c;
    var id = _a.id;
    var router = navigation_1.useRouter();
    var _d = react_1.useDisclosure(), isOpen = _d.isOpen, onOpen = _d.onOpen, onOpenChange = _d.onOpenChange;
    var session = react_3.useSession();
    return (React.createElement("div", { className: 'grid grid-cols-12' },
        React.createElement("div", { className: 'flex flex-row gap-4 col-span-3 pl-4' },
            React.createElement(react_1.Button, { isIconOnly: true, color: "primary", "aria-label": "home", onPress: function () { return router.push('/agent/' + id); } },
                React.createElement(solid_1.HomeIcon, null)),
            ((_b = session.data) === null || _b === void 0 ? void 0 : _b.user.roles.includes('2')) || ((_c = session.data) === null || _c === void 0 ? void 0 : _c.user.roles.includes('3')) ?
                React.createElement(react_1.Button, { isIconOnly: true, color: "primary", onPress: function () { return router.push('/monitor'); } },
                    React.createElement(solid_1.AdjustmentsHorizontalIcon, null)) :
                ''),
        React.createElement("div", { className: "flex flex-row col-span-8 space-x-4 items-center " },
            React.createElement("span", { className: "font-bold" }, "Agente - 3650 "),
            React.createElement(solid_1.ClockIcon, { className: "h-10" }),
            React.createElement("div", null, "13:16"),
            React.createElement(react_1.Button, { onPress: onOpen },
                React.createElement(solid_1.PlayPauseIcon, { className: "h-10 text-primary" }))),
        React.createElement(react_1.Button, { isIconOnly: true, color: "primary", "aria-label": "logout", onPress: function () { return react_3.signOut(); } },
            React.createElement(solid_1.ArrowRightStartOnRectangleIcon, { className: "col-span-1 h-10 " })),
        React.createElement(react_1.Modal, { isOpen: isOpen, onOpenChange: onOpenChange },
            React.createElement(react_1.ModalContent, null, function (onClose) { return (React.createElement(React.Fragment, null,
                React.createElement(react_1.ModalHeader, { className: "flex flex-col gap-1 text-black" }, "Pausar"),
                React.createElement(react_1.ModalBody, null,
                    React.createElement("div", { className: 'flex flex-col gap-1 text-black text-lg' },
                        React.createElement(react_1.Button, { color: "primary", className: 'text-lg' }, "10 Minutos"),
                        React.createElement(react_1.Button, { color: "primary", className: 'text-lg' }, "15 Minutos"),
                        React.createElement(react_1.Button, { color: "primary", className: 'text-lg' }, "Treinamento"),
                        React.createElement(react_1.Button, { color: "primary", className: 'text-lg' }, "Feedback"))),
                React.createElement(react_1.ModalFooter, null,
                    React.createElement(react_1.Button, { color: "danger", variant: "light", onPress: onClose }, "Fechar"),
                    React.createElement(react_1.Button, { color: "primary", onPress: onClose }, "Pausar")))); }))));
};
exports.Sidebar = function () {
    var router = navigation_1.useRouter();
    var _a = providers_1.useTicketContext(), ticketContext = _a.ticketContext, setTicketContext = _a.setTicketContext, isMounted = _a.isMounted;
    var tickets = ticketContext.tickets, companies = ticketContext.companies;
    var _b = react_2.useState([]), ticketList = _b[0], setTicketList = _b[1];
    var len = tickets.length;
    react_2.useEffect(function () {
        var list = companies.map(function (el) { return (__assign(__assign({}, el), { tickets: [] })); });
        tickets.forEach(function (el) {
            var comp = list.find(function (item) { return item.id == el.company_id; });
            comp === null || comp === void 0 ? void 0 : comp.tickets.push(el);
        });
        setTicketList(list);
    }, [isMounted, len]);
    var newTicket = function (company) { return __awaiter(void 0, void 0, void 0, function () {
        var response, ticket, newTickets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.createTicket({ company_id: company.id })];
                case 1:
                    response = _a.sent();
                    if (!response) return [3 /*break*/, 3];
                    ticket = JSON.parse(response);
                    newTickets = __spreadArrays(tickets, [ticket]);
                    return [4 /*yield*/, setTicketContext(__assign(__assign({}, ticketContext), { tickets: newTickets }))];
                case 2:
                    _a.sent();
                    router.push('/agent/triage/' + ticket.id);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var redirectToTicket = function (id) {
        router.push('/agent/triage/' + id);
    };
    return (React.createElement("div", { className: "bg-primary px-2 py-2 text-primary overflow-auto" },
        React.createElement(react_1.Accordion, { isCompact: true, showDivider: true, selectionMode: 'multiple', itemClasses: { base: 'bg-zinc-100 my-1' } }, ticketList.map(function (el) {
            var _a;
            return React.createElement(react_1.AccordionItem, { key: el.name, "aria-label": 'Accordion ' + el.name, startContent: React.createElement(CompanyComponent, { label: el.fantasy_name, mass: el.mass, count: el.tickets.length }) },
                React.createElement(Client, { name: '+ Novo Atendimento', onClick: function () { return newTicket(el); } }), (_a = el.tickets) === null || _a === void 0 ? void 0 :
                _a.map(function (item) {
                    return React.createElement(Client, { name: '#' + item.id, timer: '0:00', key: item.id, onClick: function () { return redirectToTicket(item.id); } });
                }));
        }))));
};
var CompanyComponent = function (_a) {
    var label = _a.label, mass = _a.mass, count = _a.count;
    return (React.createElement("div", { className: "flex flex-row w-full justify-between" },
        React.createElement("div", { className: "px-2 content-center" + (mass ? " bg-danger mx-1 rounded text-white font-bold" : "") }, mass ? '!!' : '  '),
        React.createElement("div", { className: "content-center border bg-success px-2 rounded text-white " },
            React.createElement("p", null, count)),
        React.createElement("div", { className: "justify-center px-2 py-1 " }, label)));
};
var Client = function (_a) {
    var name = _a.name, _b = _a.timer, timer = _b === void 0 ? '' : _b, onClick = _a.onClick;
    return (
    // <Link href="/agent/triage">
    React.createElement(react_1.Button, { className: "flex flex-row align-center rounded space-x-2 shadow-sm shadow-zinc-400 pt-1 mx-2 hover:bg-zinc-400", onClick: onClick },
        React.createElement("div", { className: "flex  w-2/12 justify-center  py-1 " }),
        React.createElement("div", { className: "flex rounded w-8/12 justify-center py-1  text-sm" }, name),
        React.createElement("div", { className: "flex rounded text-sm px-2" }, timer))
    // </Link>
    );
};
