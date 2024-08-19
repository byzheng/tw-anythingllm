/*\

Anything LLM in tiddlywiki 5

\*/
(function () {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

   

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

        
        var path = this.getAttribute('path', '');
        if (path === "") {
            console.log("No file path")
            return;
        }
        
        try {

            // whole conatianer for LLM
            let dom_container = document.createElement('div');
            dom_container.id = "tw-anything-llm-workspace";

            parent.insertBefore(dom_container, nextSibling);
            async function load_fulltext(path) {
                const response = await fetch(path);
                if (!response.ok) {
                    let ele = document.createElement("p");
                    ele.innerText = "No full text is found.";
                    dom_container.appendChild(ele);
                    return;
                }
                const data = await response.text();
                let txt = data.split(/\r?\n/);
                let h2_keywords = [
                    "abstract",
                    "introduction", 
                    "material",
                    "method",
                    "result",
                    "discussion",
                    "conclusion"
                ];
                // hide all elements after this keywords are dectected
                let hidden_keywords = [
                    "appendix",
                    "supplementary", 
                    "declaration",
                    "acknowledgements"
                ];
                let hidden = false;
                for (let i = 0; i < txt.length; i++) {
                    let txt_i = txt[i].trim();
                    if (txt_i === "") {
                        continue;
                    }
                    let word_count = txt_i.split(/\s+/).length;
                    let ele;
                    if (word_count < 10) {
                        // for h2 heading
                        let tag = "h3";
                        if (h2_keywords.some(el => txt_i.toLowerCase().includes(el))) {
                            tag = "h2";
                        }
                        ele = document.createElement(tag);
                        // hide some elements
                        if (hidden || hidden_keywords.some(el => txt_i.toLowerCase().includes(el))) {
                            hidden = true;
                        }
                        ele.innerText = txt_i;
                    } else {
                        ele = document.createElement('p');
                        ele.innerHTML = $tw.wiki.renderText("text/html", "text/vnd.tiddlywiki", txt_i);
                    }
                    if (ele !== undefined) {
                        ele.hidden = hidden;
                        dom_container.appendChild(ele);
                    }
                }
                //let html_text = $tw.wiki.renderText("text/html", "text/vnd.tiddlywiki", data);
                
                //dom_container.innerHTML = html_text ;  
            }
            load_fulltext(path);
            

        } catch (e) {
            console.log(e)
        }
    };

    /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
     */
    MyWidget.prototype.refresh = function (changedTiddlers) {};

    exports.fulltext = MyWidget;

})();