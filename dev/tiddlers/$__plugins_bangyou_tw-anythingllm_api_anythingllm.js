"use strict";


function AnythingLLM(apikey, host = "http://127.0.0.1:3001")   {
	const this_apikey = apikey;
  const this_host = host;

   var request = async function(endpoint = "", options = {}) {
        let url = new URL("/api/v1" + endpoint, this_host);

        let headers = {
            'Authorization': 'Bearer ' + this_apikey + '',
            'Content-type': 'application/json'
        };
        
        options.headers = headers;
        console.log(url);
        console.log(options);
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
		this.request = request;
	
	
    var documents = async function() {
        const options = {
            method: 'GET'
        };
        var res = await request('/documents', options);
        console.log(res);
        return res;
    }
		this.documents = documents;
	
		var chats = async function(workspace, thread) {
        const options = {
            method: 'GET'
        };
        let path = "/workspace/" + workspace + "/thread/" + thread + "/chats";
        var res = await request(path, options);
        return res;
    }
		this.chats = chats;
	
    var chat = async function(workspace, thread, message, mode = "chat") {
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
		this.chat = chat;
}

exports.AnythingLLM = AnythingLLM;