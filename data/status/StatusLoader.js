// data/status/StatusLoader.js

var StatusLoader = function(c) {
    StatusLoader.superclass.constructor.call(this, Ext.apply({
        url: c.datasrc.url + (c.path || 'jsontree')
    }, c));
    this.on("beforeload", function(treeLoader, node) {
        if (!this.url)
            return false;
        this.baseParams._ = node.attributes.id;
        return true;
    }, this);
};

Ext.extend(StatusLoader, Ext.tree.TreeLoader, {
    requestMethod: "GET",
    createNode: function(attr) {
        //attr.iconCls = attr.type;
        return StatusLoader.superclass.createNode.call(this, attr);
    },
    getParams: function(node) {
        var buf = [], bp = this.baseParams;
        for(var key in bp) {
            if(typeof bp[key] != "function") {
                buf.push(encodeURIComponent(key), "=", encodeURIComponent(bp[key]), "&");
            }
        }
        return buf.join("");
    }
});
