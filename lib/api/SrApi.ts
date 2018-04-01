﻿import Log from "../framework/Log";
import IApiConnection from "./IApiConnection";
import SrServiceRequest from "./SrServiceRequest";
import SrServiceResponse from "./SrServiceResponse";
import SrStats from "../framework/SrStats";
import { runtime } from "../framework/SrApp";
import CommonMessages from "../messaging/CommonMessages";
import IApiInitializer from "../config/IApiInitializer";
import RequestType from "./RequestType";

export default class SrApi {
    private initialized: boolean = false;
    private connection: IApiConnection = null;
    private pendingRequests: { [id: string]: SrServiceRequest } = {};

    constructor() {

    }

    public initialize(initializer: IApiInitializer): void {
        if (this.initialized) {
            return;
        }

        if (initializer == null) {
            Log.w(this, "Invalid API initializer supplied.  Cannot initialize API.  Proceeding without API.");
            runtime.messaging.broadcast(CommonMessages.ApiInitialized);
            return;
        }

        this.connection = initializer.buildConnection();
        this.connection.onResponse = (resp: SrServiceResponse) => {
            this.handleResponse(resp);
        };
        this.connection.onFailedRequest = (req: SrServiceRequest, errors: any[]) => {
            this.handleFailedRequest(req, errors);
        };

        this.connection.initialize((s: boolean) => {
            Log.d(this, "API Initialization callback", { success: s });
            this.initialized = s;
            runtime.messaging.broadcast(s ? CommonMessages.ApiInitialized : CommonMessages.ApiInitializationFailed, true);
        }, false);
    }

    public checkApi(): void {
        Log.t(this, "Checking API");
        var cutoff: number = new Date().getTime() - runtime.config.staleApiRequestPeriod;
        var staleRequests: SrServiceRequest[] = [];
        for (var id in this.pendingRequests) {
            if (this.pendingRequests.hasOwnProperty(id)) {
                var req: SrServiceRequest = this.pendingRequests[id];
                if (SrStats.getStartTime(req.requestId) <= cutoff) {
                    Log.d(this, "Pending request timed out", req);
                    staleRequests.push(req);
                }
            }
        }

        staleRequests.forEach((r: SrServiceRequest) => {
            this.handleStaleRequest(r);
        });
    }

    private handleStaleRequest(req: SrServiceRequest): void {
        this.sendRequest(req);
    }

    public connected(): boolean {
        if (!this.initialized) {
            return false;
        }
        return this.connection.connected();
    }

    public sendMessage(
        type: RequestType,
        action: string,
        content: any,
        options: any,
        manualCb: (resp: SrServiceResponse) => void = null,
        resendOnFailure: boolean = true): string {
        if (!this.connected()) {
            Log.e(this, "Attempt to send message against unconnected service", { action: action, content: content });
            return;
        }
        var req: SrServiceRequest = new SrServiceRequest(type, action, content, options, resendOnFailure, manualCb);
        this.sendRequest(req);
        return req.requestId;
    }

    private sendRequest(req: SrServiceRequest): void {
        if (req.requestId == null) {
            req.requestId = SrStats.start();
        }
        req.sendAttempts++;
        this.pendingRequests[req.requestId] = req;
        this.connection.sendRequest(req);
    }

    private handleResponse(resp: SrServiceResponse): void {
        Log.d(this, "API Response", { response: resp });
        if (this.pendingRequests[resp.requestId]) {
            var req: SrServiceRequest = this.removeRequest(resp.requestId);
            this.processMessage(req, resp);
        }
    }

    private removeRequest(requestId: string): SrServiceRequest {
        var origReq: SrServiceRequest = this.pendingRequests[requestId];
        delete this.pendingRequests[requestId];
        return origReq;
    }

    private processMessage(req: SrServiceRequest, resp: SrServiceResponse): void {
        SrStats.stop(req.requestId, "API send success", { request: req, response: resp });
        if (!resp.good) {
            Log.w(this, "API result not successful", { request: req, response: resp });
        }
        if (req.callbackHandler != null) {
            req.callbackHandler(resp);
        }
        runtime.messaging.broadcast(resp.action, false, resp);
    }

    private handleFailedRequest(req: SrServiceRequest, errors: any[]): void {
        SrStats.stop(req.requestId, "API send failure", req);

        this.removeRequest(req.requestId);
        var resp: SrServiceResponse = new SrServiceResponse();
        resp.action = req.action;
        resp.requestId = req.requestId;
        resp.data = null;
        resp.good = false;
        resp.errors = errors;

        Log.e(this, "API send failed", { request: req, response: resp });

        if (req.callbackHandler) {
            req.callbackHandler(resp);
        }
    }
}
