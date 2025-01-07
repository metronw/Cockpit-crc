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
exports.POST = void 0;
var server_1 = require("next/server");
var localDb_1 = require("@/app/lib/localDb"); // Importação do tipo Queue corrigida
var next_auth_1 = require("next-auth");
var authOptions_1 = require("@/app/lib/authOptions");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session, sessionUser, _a, trunk_name, callid, callernum, queue, company_id, ticket, error_1, err, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, next_auth_1.getServerSession(authOptions_1.authOptions)];
                case 1:
                    session = _b.sent();
                    sessionUser = session === null || session === void 0 ? void 0 : session.user.id;
                    if (!sessionUser) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Usuário não está logado' }, { status: 401 })];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 3:
                    _a = _b.sent(), trunk_name = _a.trunk_name, callid = _a.callid, callernum = _a.callernum;
                    if (!trunk_name || !callid) {
                        return [2 /*return*/, new Response(JSON.stringify({ status: 400, message: 'Dados insuficientes' }), { status: 400 })];
                    }
                    return [4 /*yield*/, localDb_1["default"].queue.findFirst({
                            where: { trunk_name: trunk_name }
                        })];
                case 4:
                    queue = _b.sent();
                    if (!queue) {
                        return [2 /*return*/, new Response(JSON.stringify({ status: 404, message: 'Fila não encontrada' }), { status: 404 })];
                    }
                    company_id = queue.company_id;
                    return [4 /*yield*/, localDb_1["default"].ticket.create({
                            data: {
                                company_id: company_id,
                                status: 'triage',
                                user_id: sessionUser,
                                procedures: JSON.stringify([]),
                                communication_type: 'phone',
                                communication_id: callid,
                                caller_number: callernum,
                                createdAt: new Date(),
                                trunk_name: trunk_name
                            }
                        })];
                case 5:
                    ticket = _b.sent();
                    return [2 /*return*/, new Response(JSON.stringify({ status: 200, message: 'Ticket criado com sucesso', ticket: ticket }), { status: 200 })];
                case 6:
                    error_1 = _b.sent();
                    err = error_1;
                    return [2 /*return*/, new Response(JSON.stringify({ status: 500, message: err.message }), { status: 500 })];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_2 = _b.sent();
                    console.error('Erro ao buscar dados do usuário:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Ocorreu um erro ao buscar os dados do usuário' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
