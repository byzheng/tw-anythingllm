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
        var ws_name = this.getAttribute('workspace', '');
        if (ws_name === "") {
            console.log("No workspace")
            return;
        }
        
        try {

            // whole conatianer for LLM
            let dom_container = document.createElement('div');
            dom_container.id = "tw-anything-llm-workspace";

            parent.insertBefore(dom_container, nextSibling);
            
            var llm = new anythingllm.AnythingLLM(apikey, host);
            // for workspace
            async function workspace(ws_name) {
                let resp = await llm.workspace(ws_name);
                let text_tw = "";
                text_tw += "|!Name|" + resp.workspace[0].name + "|\n";
                text_tw += "|!Slug|" + resp.workspace[0].slug + "|\n";
                text_tw += "!!! Threads\n";
                for (let i = 0; i < resp.workspace[0].threads.length; i++) {
                    let f = '[field:thread-slug['+ 
                        resp.workspace[0].threads[i].slug +
                        ']!has[draft.of]]';
                    let thread_tid = $tw.wiki.filterTiddlers(f);
                    if (thread_tid.length === 1) {
                        let tid = $tw.wiki.getTiddler(thread_tid[0]);
                        text_tw += "* [[" +
                            thread_tid[0] + 
                            "]]"; 
                    } else {
                        text_tw += "* " + resp.workspace[0].threads[i].slug;
                    }
                    
                }
                let html_tw = $tw.wiki.renderText("text/html", 
                    "text/vnd.tiddlywiki", 
                    text_tw);
                dom_container.innerHTML = html_tw;  
                let ele = dom_container
                    .querySelectorAll(".tc-tiddlylink");
                for (let i = 0; i < ele.length; i++) {
                    ele[i].addEventListener("click", function (event) {
                            event.preventDefault();
                            let title = event.target.innerText;
                            the_story.addToStory(title, current_tiddler, {
                                openLinkFromInsideRiver: openLinkFromInsideRiver,
                                openLinkFromOutsideRiver: openLinkFromOutsideRiver
                            });
                            the_story.addToHistory(title);
                        });
                }   
            }
            workspace(ws_name);
            

        } catch (e) {
            console.log(e)
        }
    };

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    MyWidget.prototype.refresh = function (changedTiddlers) {};

    exports.workspace = MyWidget;

})();