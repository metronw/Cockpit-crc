'use server';
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
exports.getUsers = exports.createMetroTicket = exports.getTicketContext = exports.getCompaniesList = exports.getOpenTickets = exports.createTicket = exports.getCrcFatherTicketTypes = exports.getCrcTicketTypes = void 0;
var db_1 = require("@/app/lib/db");
var localDb_1 = require("@/app/lib/localDb");
var next_auth_1 = require("next-auth");
var authOptions_1 = require("../lib/authOptions");
function getCrcTicketTypes() {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1["default"].query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
                        + 'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
                        + 'where ticket_type_product.id_product = 2 ')];
                case 1:
                    rows = (_a.sent())[0];
                    return [2 /*return*/, JSON.stringify(rows)];
            }
        });
    });
}
exports.getCrcTicketTypes = getCrcTicketTypes;
function getCrcFatherTicketTypes() {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1["default"].query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
                        + 'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
                        + 'where ticket_type_product.id_product = 2 AND ticket_type.id = ticket_type.id_father')];
                case 1:
                    rows = (_a.sent())[0];
                    return [2 /*return*/, JSON.stringify(rows)];
            }
        });
    });
}
exports.getCrcFatherTicketTypes = getCrcFatherTicketTypes;
// async function getApiCredentials(){
//   return {
//     token: '5b7efd3d9402cc18ces9g4l1',
//     password:'123456'
//   }
// }  
function createTicket(_a) {
    var company_id = _a.company_id;
    return __awaiter(this, void 0, void 0, function () {
        var session, ticket;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, next_auth_1.getServerSession(authOptions_1.authOptions)];
                case 1:
                    session = _b.sent();
                    if (!session) return [3 /*break*/, 3];
                    return [4 /*yield*/, localDb_1["default"].ticket.create({
                            data: { company_id: company_id, status: 'triage', user_id: session.user.id, procedures: JSON.stringify([]) }
                        })];
                case 2:
                    ticket = _b.sent();
                    return [2 /*return*/, JSON.stringify(ticket)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.createTicket = createTicket;
exports.getOpenTickets = function () { return __awaiter(void 0, void 0, void 0, function () {
    var session, filteredTickets;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, next_auth_1.getServerSession(authOptions_1.authOptions)];
            case 1:
                session = _a.sent();
                if (!session) return [3 /*break*/, 3];
                return [4 /*yield*/, localDb_1["default"].ticket.findMany({
                        where: {
                            user_id: session.user.id,
                            status: { not: 'closed' }
                        }
                    })];
            case 2:
                filteredTickets = _a.sent();
                return [2 /*return*/, JSON.stringify(filteredTickets)];
            case 3: return [2 /*return*/, '[]'];
        }
    });
}); };
function getCompaniesList() {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1["default"].query('SELECT client.* FROM client ' +
                        'INNER JOIN contract ON contract.id_client = client.id' +
                        ' INNER JOIN contract_product ON contract_product.id_contract = contract.id' +
                        ' WHERE client.status >= 1 AND contract_product.id_product = 2 ')];
                case 1:
                    rows = (_a.sent())[0];
                    return [2 /*return*/, JSON.stringify(rows)
                        // $client = Client::leftJoin('contract', 'contract.id_client', '=', 'client.id')
                        //   ->leftJoin('contract_product', 'contract_product.id_contract', '=', 'contract.id')
                        //   ->select('client.*')
                        //   ->where('client.status', '>=' ,1)
                        //   ->where('contract_product.id_product', '2')
                        //   ->orderBy('fantasy_name')
                        //   ->get();
                    ];
            }
        });
    });
}
exports.getCompaniesList = getCompaniesList;
function getTicketContext(user_id) {
    return __awaiter(this, void 0, void 0, function () {
        var companies, _a, _b, userAssignments_1, filteredComp, tickets, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!user_id) return [3 /*break*/, 4];
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, getCompaniesList()];
                case 1:
                    companies = _b.apply(_a, [_e.sent()]);
                    return [4 /*yield*/, localDb_1["default"].user_assign.findMany({ where: { user_id: user_id } })];
                case 2:
                    userAssignments_1 = _e.sent();
                    filteredComp = companies.filter(function (el) { return userAssignments_1.find(function (item) { return item.company_id == el.id; }); });
                    _d = (_c = JSON).parse;
                    return [4 /*yield*/, exports.getOpenTickets()];
                case 3:
                    tickets = _d.apply(_c, [_e.sent()]);
                    return [2 /*return*/, JSON.stringify({ companies: filteredComp, tickets: tickets })];
                case 4: return [2 /*return*/, JSON.stringify({ companies: [], tickets: [] })];
            }
        });
    });
}
exports.getTicketContext = getTicketContext;
function createMetroTicket(ticketInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var type, erp, phone, company_id, client_name, err_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!ticketInfo) return [3 /*break*/, 4];
                    type = ticketInfo.type, erp = ticketInfo.erp, phone = ticketInfo.phone, company_id = ticketInfo.company_id, client_name = ticketInfo.client_name;
                    if (!(!!type && !!company_id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1["default"].query("INSERT INTO ticket (id_client, id_ticket_status, subject, id_product, origem, id_ticket_type, created_by, erp_protocol, phone, created_at, updated_at )" +
                            ("VALUES (" + company_id + ", 4, \"teste\", 2, 0, " + parseInt(type) + ", 424, " + (isNaN(parseInt(erp)) ? null : parseInt(erp)) + ", " + (isNaN(parseInt(phone)) ? null : parseInt(phone)) + ", NOW(), NOW())"))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, localDb_1["default"].ticket.update({
                            where: {
                                id: ticketInfo.id
                            },
                            data: { company_id: company_id, status: 'closed', user_id: 424, client_name: client_name, type: parseInt(type) }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { status: 200, message: 'ticket criado com sucesso' }];
                case 3: return [2 /*return*/, ({ status: 400, message: 'dados errados' })];
                case 4: return [2 /*return*/, { status: 400, message: 'Nenhum ticket foi enviado' }];
                case 5:
                    err_1 = _a.sent();
                    error = err_1;
                    return [2 /*return*/, { status: 500, message: error.message }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.createMetroTicket = createMetroTicket;
function getUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var session, filteredUsers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, next_auth_1.getServerSession(authOptions_1.authOptions)];
                case 1:
                    session = _a.sent();
                    if (!session) return [3 /*break*/, 3];
                    return [4 /*yield*/, localDb_1["default"].user.findMany({})];
                case 2:
                    filteredUsers = _a.sent();
                    return [2 /*return*/, JSON.stringify(filteredUsers)];
                case 3: return [2 /*return*/, '[]'];
            }
        });
    });
}
exports.getUsers = getUsers;
