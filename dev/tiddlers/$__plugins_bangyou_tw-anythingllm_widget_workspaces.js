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
        
        try {

            // whole conatianer for LLM
            let dom_container = document.createElement('div');
            dom_container.id = "tw-anything-llm";

            parent.insertBefore(dom_container, nextSibling);
            
            var llm = new anythingllm.AnythingLLM(apikey, host);
            // for workspace
            async function workspaces() {
                let resp = await llm.workspaces();
                let text_tw = "|!Name|!Slug|";
                for (let i = 0; i < resp.workspaces.length; i++) {
                    text_tw += "\n|" + resp.workspaces[i].name + 
                        "|[[" + resp.workspaces[i].slug + "]]|";
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
            workspaces();
            

        } catch (e) {
            console.log(e)
        }
    };

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    MyWidget.prototype.refresh = function (changedTiddlers) {};

    exports.workspaces = MyWidget;

})();