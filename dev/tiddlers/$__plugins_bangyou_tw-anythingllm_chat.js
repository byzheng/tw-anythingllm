/*\

Anything LLM in tiddlywiki 5

\*/
(function () {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    if ($tw.browser) {
        var anythingllm = require("$:/plugins/bangyou/tw-anythingllm/api/anythingllm.js");
    }

    var Widget = require("$:/core/modules/widgets/widget.js").widget;

    var MyWidget = function (parseTreeNode, options) {
        this.initialise(parseTreeNode, options);
    };

    /*
    Inherit from the base widget class
     */
    MyWidget.prototype = new Widget();

    // Render this widget into the DOM
    MyWidget.prototype.render = function (parent, nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        var openLinkFromInsideRiver = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromInsideRiver").fields.text;
        var openLinkFromOutsideRiver = $tw.wiki.getTiddler("$:/config/Navigation/openLinkFromOutsideRiver").fields.text;
        var current_tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
        var the_story = new $tw.Story({
            wiki: $tw.wiki
        });
        var apikey = $tw.wiki.getTiddler("$:/config/anythingllm/apikey");
        if (apikey === undefined) {
            alert("Setup $:/config/anythingllm/apikey for api key");
            return;
        } else {
            apikey = apikey.fields.text;
            if (apikey === "") {
                alert("Setup $:/config/anythingllm/apikey for api key");
                return;
            }
        }
        var host = $tw.wiki.getTiddler("$:/config/anythingllm/host");
        if (host === undefined) {
            host = "http://127.0.0.1:3001";
        } else {
            host = host.fields.text;
        }
        // Start to working on anything LLM
        var workspace = this.getAttribute('workspace', '');
        if (workspace === "") {
            console.log("No workspace")
            return;
        }

        var thread = this.getAttribute('thread', '');
        if (thread === "") {
            thread = 'default';
        }
        
        try {

            // whole conatianer for LLM
            let dom_container = document.createElement('div');
            dom_container.id = "tw-anything-llm";
            // for chat history
            let dom_chat_history = document.createElement("div");
            dom_chat_history.id = 'tw-anything-llm-chats';

            // for text area of inputs
            let dom_textarea = document.createElement("textarea");
            dom_textarea.id = 'tw-anything-llm-textarea';
            // submit button
            let dom_submit = document.createElement("INPUT");
            dom_submit.setAttribute("type", "button");
            dom_submit.id = "tw-anything-llm-submit";
            dom_submit.setAttribute("value", "Submit");
            dom_textarea.focus();
            function ask_question() {
                let message = dom_textarea.value;
                if (message === "") {
                    return;
                }
                chat(workspace, thread, message);
                dom_textarea.value = "";
            };
            var go_bottom = function () {
                dom_container.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                });
            };
            dom_submit.onclick = ask_question;
            dom_textarea.addEventListener("keypress", e => {
                if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    ask_question();
                }
            })

            let dom_bottom = document.createElement("INPUT");
            dom_bottom.setAttribute("type", "button");
            dom_bottom.id = "tw-anything-llm-bottom";
            dom_bottom.setAttribute("value", "Bottom");
            dom_bottom.onclick = go_bottom;

            let dom_chat_button = document.createElement("div");
            dom_chat_button.appendChild(dom_bottom);
            dom_chat_button.appendChild(dom_submit);
            let dom_chat_tool = document.createElement("div");
            dom_chat_tool.appendChild(dom_textarea);
            dom_chat_tool.appendChild(dom_chat_button);
            dom_chat_tool.classList.add("sticky");
            dom_chat_tool.classList.add("box");
            dom_chat_tool.classList.add("chat-tool");
            dom_container.appendChild(dom_chat_history);
            dom_container.appendChild(dom_chat_tool);

            parent.insertBefore(dom_container, nextSibling);

            

            var llm = new anythingllm.AnythingLLM(apikey, host);

            function render_chat(chat) {
                let dom_chat = document.createElement('div');
                dom_chat.classList.add("box");
                dom_chat.classList.add("chat-" + chat.role);
                //dom_chat.innerText = chat.content;
                let html_text = $tw.wiki.renderText("text/html", "text/markdown", chat.content);
                dom_chat.innerHTML = html_text;

                if (chat.sources !== undefined) {
                    let dom_sources = document.createElement('div');
                    dom_sources.classList.add("box");
                    dom_sources.classList.add("chat-sources");
                    let dom_sources_links = document.createElement('div');
                    let dom_sources_text = document.createElement('div');
                    dom_sources_text.classList.add("chat-sources-text");
                    dom_sources_text.hidden = true;
                    dom_sources.appendChild(dom_sources_links);
                    dom_sources.appendChild(dom_sources_text);
                    let sources = chat.sources.map(function (item) {
                        return {
                            title: item.title,
                            text: item.text,
                            _distance: item._distance
                        }
                    });
                    sources = [...new Set(sources.map(i => JSON.stringify(Object.fromEntries(
                                        Object.entries(i)))))].map(JSON.parse);

                    for (let i = 0; i < sources.length; i++) {
                        let dom_source = document.createElement('span');
                        dom_source.classList.add("chat-source");
                        let title = sources[i].title.replace(".txt", "");
                        let dom_link = document.createElement('a');
                        dom_link.classList.add("tiddler-link");
                        dom_link.classList.add("tc-tiddlylink");
                        dom_link.classList.add("tc-tiddlylink-resolves");
                        dom_link.setAttribute("href", "#" + encodeURIComponent(title));
                        dom_link.innerText = title;
                        dom_link.addEventListener("click", function (event) {
                            event.preventDefault();
                            the_story.addToStory(title, current_tiddler, {
                                openLinkFromInsideRiver: openLinkFromInsideRiver,
                                openLinkFromOutsideRiver: openLinkFromOutsideRiver
                            });
                            the_story.addToHistory(title);
                        });

                        // for distance
                        let dom_dis = document.createElement('a');
                        dom_dis.setAttribute("href", "#");
                        dom_dis.innerText = " (" +
                            Math.round(sources[i]._distance * 100) +
                            "%)";
                        // display text when click on distance
                        dom_dis.addEventListener("click", function (event) {
                            event.preventDefault();
                            dom_sources_text.hidden = false;
                            dom_sources_text.innerHTML = sources[i].text;
                        });

                        // Add to child
                        dom_source.appendChild(dom_link);
                        dom_source.appendChild(dom_dis);
                        dom_sources_links.appendChild(dom_source);
                    }
                    dom_chat.appendChild(dom_sources);
                }

                dom_chat_history.appendChild(dom_chat);
            }
            // for chat history
            async function chats(workspace, thread) {
                let resp;
                if (thread == "default") {
                    resp = await llm.chats(workspace);
                } else {
                    resp = await llm.chatsThread(workspace, thread);
                }
                
                
                for (let i = 0; i < resp.history.length; i++) {
                    render_chat(resp.history[i]);
                }

            }
            chats(workspace, thread);
            // Ask question
            async function chat(workspace, thread, message) {
                render_chat({
                    role: "user",
                    content: message
                });
                dom_textarea.disabled = true;
                go_bottom()
                let resp;
                if (thread == "default") {
                    resp = await llm.chat(workspace, message);
                } else {
                    resp = await llm.chatThread(workspace, thread, message);
                }
                render_chat({
                    role: "assistant",
                    content: resp.textResponse,
                    sources: resp.sources
                });
                go_bottom()
                dom_textarea.disabled = false;
            }

        } catch (e) {
            console.log(e)
        }
    };

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    MyWidget.prototype.refresh = function (changedTiddlers) {};

    exports.chat = MyWidget;

})();