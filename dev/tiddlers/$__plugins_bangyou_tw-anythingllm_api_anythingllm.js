"use strict";

function AnythingLLM(apikey, host = "http://127.0.0.1:3001") {
    const this_apikey = apikey;
    const this_host = host;

    var request = async function (endpoint = "", options = {}) {
        let url = new URL("/api/v1" + endpoint, this_host);

        let headers = {
            'Authorization': 'Bearer ' + this_apikey + '',
            'Content-type': 'application/json'
        };

        options.headers = headers;
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    this.request = request;

    var documents = async function () {
        const options = {
            method: 'GET'
        };
        var res = await request('/documents', options);
        return res;
    }
    this.documents = documents;
    
    
    var document = async function (name) {
        const options = {
            method: 'GET'
        };
        var res = await request('/document/' + name, options);
        return res;
    }
    this.document = document;
    
    
    // workspaces
    var workspaces = async function () {
        const options = {
            method: 'GET'
        };
        let path = "/workspaces";
        var res = await request(path, options);
        return res;
    }
    this.workspaces = workspaces;
    // workspace
    var workspace = async function (slug) {
        const options = {
            method: 'GET'
        };
        let path = "/workspace/" + slug;
        var res = await request(path, options);
        return res;
    }
    this.workspace = workspace;
    
    
    
    // chats history for workspace default thread
    var chats = async function (workspace) {
        const options = {
            method: 'GET'
        };
        let path = "/workspace/" + workspace + "/chats";
        var res = await request(path, options);
        return res;
    }
    this.chats = chats;
    // new chat for workspace default thread
    var chat = async function (workspace, message, mode = "chat") {
        const options = {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                mode: mode,
                userId: 1
            })
        };
        let path = "/workspace/" + workspace + "/chat";
        var res = await request(path, options);
        return res;
    }
    this.chat = chat;
    
    // for chat history by thread
    var chatsThread = async function (workspace, thread) {
        const options = {
            method: 'GET'
        };
        let path = "/workspace/" + workspace + "/thread/" + thread + "/chats";
        var res = await request(path, options);
        return res;
    }
    this.chatsThread = chatsThread;
    
    // for new chat by thread
    var chatThread = async function (workspace, thread, message, mode = "chat") {
        const options = {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                mode: mode,
                userId: 1
            })
        };
        let path = "/workspace/" + workspace + "/thread/" + thread + "/chat";
        var res = await request(path, options);
        return res;
    }
    this.chatThread = chatThread;
}

exports.AnythingLLM = AnythingLLM;