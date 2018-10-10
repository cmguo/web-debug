// log.js

var StreamJsonStore = function(c) {
    StreamJsonStore.superclass.constructor.call(this, c);
};

Ext.extend(StreamJsonStore, Ext.data.JsonStore, {
    load: function(options){
        options = options || {};
        if(this.fireEvent("beforeload", this, options) !== false){
            this.storeOptions(options);
            var p = Ext.apply(options.params || {}, this.baseParams);
            var oReq = new XMLHttpRequest();
            var state = {
                store: this, 
                position: 0,
                parse: function(response) {
                    var end = response.indexOf('}\n', this.position);
                    while (end > 0) {
                        var line = response.substring(this.position, end + 1);
                        line = line.replace(new RegExp("\n", 'g'), "\\n");
                        var result = Ext.decode(line);
                        this.store.put(result);
                        this.position = end + 2;
                        end = response.indexOf('}\n', this.position);
                    }
                }
            };
            this.removeAll();
            this.put({
                time: new Date().getTime(),
                pid: 0, 
                tid: 0, 
                priority: 7,
                tag: '---',
                msg: this.url
            });
            oReq.onreadystatechange = function() {
                if (this.readyState > 2) {
                    state.parse(this.responseText);
                }
            }
            if (this.oReq)
                this.oReq.abort();
            this.oReq = oReq;
            oReq.open("get", this.url, true);
            oReq.send();
            return true;
        } else {
            return false;
        }
    }, 
    put: function(record) {
        convert_record(this.recordType, record);
        record = new Ext.data.Record(record);
        if (this.filterFn && !this.filterFn(record)) {
            if(this.snapshot){
                record.join(this);
                this.snapshot.add(record);
            }
            return;
        }
        this.add(record);
    },
    addFilter: function(property, value, anyMatch, caseSensitive){
        this.filters = this.filters || {};
        if (typeof value != "function") {
            value = String(value);
            var regex = new RegExp((anyMatch === true ? '' : '^') 
                + Ext.escapeRe(value) + (anyMatch === true ? '' : '$'), 
                caseSensitive ? '' : 'i');
            value = regex.test.bind(regex);
        }
        this.filters[property] = value;
        this.updateFilter();
    },
    clearFilter: function(property) {
        delete this.filters[property];
        this.updateFilter();
    },
    toggleFilter: function(property, value, anyMatch, caseSensitive) {
        if (this.filters && this.filters[property])
            this.clearFilter(property);
        else
            this.addFilter(property, value, anyMatch, caseSensitive);
    },
    updateFilter: function(){
        var filters = this.filters;
        this.filterFn = function(r) {
            for (var f in filters) {
                if (!filters[f](r.data[f])) {
                    return false;
                }
            }
            return true;
        }
        this.filterBy(this.filterFn);
    }
});

var log_store = new StreamJsonStore({
    fields: [ {name: 'time', convert: function(v) { return new Date(v); } }, 'pid', 'tid', 'tag', 'msg'],
    url: 'http://127.0.0.1:8080/log?w=&f=json'
});

var panel_log = {
    id: 'log-panel', 
    title: '日志', 
    bodyBorder: false,
    autoWidth: true, 
    columns: [{
        id: 'time', 
        xtype: 'date', 
        header : '时间', 
        renderer: Ext.util.Format.dateRenderer('m-d h:i:s.u'),
        width: 140
    }, {
        id: 'pid', 
        header : '进程', 
        width: 60
    }, {
        id: 'tid', 
        header : '线程', 
        width: 60
    }, {
        id: 'tag', 
        header : '模块', 
        width: 160
    }, {
        id: 'msg', 
        header: '消息', 
        width: 600
    }], 
    viewConfig: {
        getRowClass: function(record, index) {
            return 'log-' + record.data.priority;
        }
    },
    store: log_store, 
    set_url: function(url) {
        url = url + "log?w=&f=json";
        if (this.store.url != url) {
            this.store.url = url;
            this.store.load();
        }
    },
    listeners : {
        celldblclick: function(grid, rowIndex, columnIndex) {
            var store = this.getStore();
            var record = store.getAt(rowIndex);
            var field = store.fields.items[columnIndex];
            if (columnIndex == 0) {
                store.toggleFilter("priority", function(value) {
                    return value >= record.data.priority;
                });
            } else if (columnIndex == 4) {
                if (window.clipboardData && window.clipboardData.setData) {
                    window.clipboardData.setData('text', record.data[field.name]);
                }
                return;
            } else {
                store.toggleFilter(field.name, record.data[field.name], false, true);
            }
            grid.getView().focusRow(store.indexOf(record));
        },
        headerclick: function(grid, columnIndex) {
            var store = this.getStore();
            var field = store.fields.items[columnIndex];
            store.clearFilter(columnIndex == 0 ? "priority" : field.name);
        }
    }
}

var logPanel = new Ext.grid.GridPanel(panel_log);