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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.text();
                let html_text = $tw.wiki.renderText("text/html", "text/vnd.tiddlywiki", data);
                
                dom_container.innerHTML = html_text ;  
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