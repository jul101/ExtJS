/**
 *
 */

//Ext.require(['*']);

//For Sort And Field Grid Use
Ext.define('DataObject', {
    extend: 'Ext.data.Model',
    //fields: ['fieldName', 'displayLabel', 'column1', 'column2']
    fields: ["treeId","fieldName","originFieldName",
        {name:'seq', type: 'int'}//for sort declare
        ,"displayLabel","dataType","alignment","displayWidth","visible","format","valueList"]
});

Ext.define('ParameterModel', {
    extend: 'Ext.data.Model',
    //fields: ['label', 'defValue']
    fields:["treeId","pramName","label","pramDataType","defValue"]
});

Ext.define('FilterModel', {
    extend: 'Ext.data.Model',
    fields: ['col0', 'col1', 'col2', 'col3', 'col4', 'col5']
});

/**JSP變數**/
//SQL List
var mainList;
var priorMonthFirstDay;     //自動帶出上個月的第一天
var priorMonthLastDay;    //自動帶出上個月的最後一天
var monthFirstDay;    //自動帶出本月的第一天
var monthLastDay;    //自動帶出本月的最後一天
var systemdate;    //自動帶系統日期

var width;
var height;

var westPanelWidth = 150;
var CONSTANTS = {
    SORT: 'Sort'
    , FIELD: 'Field'
    , priorMonthFirstDay: '$PriorMonthFirstDay'
    , priorMonthLastDay: '$PriorMonthLastDay'
    , monthFirstDay: '$MonthFirstDay'
    , monthLastDay: '$MonthLastDay'
    , systemdate: '$Date'
};


//主要的Layout Panel
var mainPanel, westPanel, centerPanel;

//Sub Tab panel
var mainTabPanel,fieldsPanel, filterPanel, parameterPanel;

var container;

//Tree Grid的下拉選單
var contextMenu;

var treeStore;
var isChange=false;
var isTreeClick=false;
Ext.onReady(function () {

    container = document.getElementById("extContainer");

    width = container.style.width == '' ? 800 : parseInt(container.style.width);
    height = container.style.height == '' ? 800 : parseInt(container.style.height);
    mainTabPanel = getMainTabPanel();
    fieldsPanel = getFieldsPanel();
    parameterPanel = getParameterPanel();

    contextMenu = getTreeGridMenu();

    westPanel = Ext.create('Ext.tree.Panel', {
        title: 'SQL List',
        store: getSqlTreeStore(),
        useArrows: true,
        rootVisible: false,
        region: 'west', // this is what makes this panel into a region within the containing layout
        margins: '2 5 5 0',
        viewConfig: {
            stripeRows: true,
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: true
            }
            ,listeners: {
                itemcontextmenu: function(view, rec, node, index, e) {
                    e.stopEvent();
                    contextMenu.showAt(e.getXY());
                    //console.log('123 rec:',rec);
                    //console.log('123 node:',node);
                    return false;
                }
            }
        },
        width: westPanelWidth,
        listeners: {
            itemclick: treeClick
        },
        border: true
    });

    centerPanel = Ext.create('Ext.tab.Panel', {
        region: 'center',
        margins: '5 0 0 0',
        activeTab: 0,
        plain: true,
        items: [
            mainTabPanel,
            fieldsPanel,
            parameterPanel
        ]
    });

    mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'PMS Query Wizard - Designer(Web)',
        width: width,
        height: height,
        dockedItems: getMainBtns(),
        defaults: {
            collapsible: true,
            split: true,
            bodyStyle: 'padding:15px'
        },
        layout: {
            type: 'border',
            padding: 5
        },
        items: [westPanel, centerPanel],
        renderTo: container
    });

    treeStore = Ext.data.StoreManager.lookup('treeStore');
});

function getParameterPanelBtns(){
    var dockedItems = [{
        xtype: 'toolbar',
        items: [{
            iconCls: 'icon_add',
            text: 'Add'
            , handler: function(){
                var store = parameterPanel.getStore();
                store.add({});
            }
        },{
            iconCls: 'icon_minus',
            text: 'Delete'
            , handler: function(){
                var selection = parameterPanel.getSelectionModel().getSelection()[0];
                if (selection) {
                    var store = parameterPanel.getStore();
                    store.remove(selection);
                }
            }
        }
        ]
    }];

    return dockedItems;
}


function getMainBtns() {
    var dockedItems = [{
        xtype: 'toolbar',
        items: [{
            iconCls: 'icon_yes',
            text: 'Save'
//            ,scope: this
            , handler: save
        }
        ]
    }];
    return dockedItems;
}

function save(){
	isChange=false;
    console.log('Save arguments',arguments);
}

/**
 * notice: json Object attribute did not apply java model object naming rule
 *         such as TABLE.D_SELECT in java will be table.dSelect but json will become table.DSelect
 *         (The cause may be that I use JSONArray to convert java model data )
 * **/
function getMainTabPanel(){

    var isBorder=false;

    var row1={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder
        ,items:[
            {xtype:'textfield',padding:5, fieldLabel: 'ID', flex:1, name: 'treeId'}
            ,{xtype:'textfield',padding:5, fieldLabel: 'Query ID', flex:1, name: 'queryId'}
            ,{
                xtype:'combo'
                ,queryMode:'local'
                ,displayField:'value'
                ,valueField:'key'
                ,store:Ext.create('Ext.data.Store', {
                    fields : ['key', 'value'],
                    data   : [
                        {key : 'Y',value: 'Yes'},
                        {key : 'N',value: 'No'}
                    ]
                })
                ,padding:5, fieldLabel: 'Publish', flex:1, name: 'publish'}
            ,{
                xtype:'combo'
                ,queryMode:'local'
                ,displayField:'value'
                ,valueField:'key'
                ,store:Ext.create('Ext.data.Store', {
                    fields : ['key', 'value'],
                    data   : [
                        {key : 'Y',value: 'Yes'},
                        {key : 'N',value: 'No'}
                    ]
                })
                ,padding:5, fieldLabel: 'Protect', flex:1, name: 'protect'}
        ]
    };

    var row2={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[{xtype:'textfield',padding:5, fieldLabel: 'Title', flex:1, name: 'title'}]
    };

    var row3={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[{xtype:'textarea',padding:5, fieldLabel: 'Prior SQL', flex:1, name: 'priSql'}]
    };

    var row4= Ext.create('Ext.tab.Panel', {
            title:'SELECT',
            //margins: '5 0 0 0',
            activeTab: 0,
            padding:5,
            border:isBorder,
            plain: true,
            items: [
                {xtype:'textarea', title: 'Detail', flex:1, name: 'DSelect'}
                ,{xtype:'textarea', title: 'Sub Total', flex:1, name: 'SSelect'}
                ,{xtype:'textarea', title: 'Total', flex:1, name: 'TSelect'}
            ]
    });

    var row5={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[{xtype:'textarea',padding:5, fieldLabel: 'FROM', flex:1, name: 'sqlFrom'}]
    };

    var row6={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[{xtype:'textarea',padding:5, fieldLabel: 'WHERE', flex:1, name: 'sqlWhere'}]
    };

    var sRow1={
        layout:'vbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[
            {xtype:'textfield',padding:5, fieldLabel: 'GROUP BY', flex:1, name: 'DGroup'}
            ,{xtype:'textfield',padding:5, fieldLabel: 'ORDER BY', flex:1, name: 'DOrder'}
        ]
    };
    var sRow2={
        layout:'vbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[
            {xtype:'textfield',padding:5, fieldLabel: 'GROUP BY', flex:1, name: 'SGroup'}
            ,{xtype:'textfield',padding:5, fieldLabel: 'ORDER BY', flex:1, name: 'SOrder'}
        ]
    };

    var row7= Ext.create('Ext.tab.Panel', {
        title:'ORDER BY & GROUP BY',
        //margins: '5 0 0 0',
        activeTab: 0,
        padding:5,
        border:isBorder,
        plain: true,
        items: [
            {title: 'Detail'
                ,items:[sRow1]}
            ,{title: 'Sub Total'
                ,items:[sRow2]}
        ]
    });

    var row8={
        layout:'hbox',pack: 'start', align: 'stretch',border:isBorder,
        items:[{xtype:'textarea',padding:5, fieldLabel: 'Description', flex:1, name: 'description'}]
    };

    var mainFormPanel = Ext.create('Ext.form.Panel', {
        title: 'Main',
        bodyPadding: '5 5 0',
        autoScroll:true,
        //width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },
        defaults: {
            border: false,
            xtype: 'panel',
            flex: 1,
            layout: 'anchor'
            ,listeners: {
                //Add a 'change' listener to each field that is added to the form
                add: function(me, component, index) {
                    if( component.isFormField ) {
                        component.on('change', me.fieldChanged, me);
                    }
                }
            },fieldChanged: function(field,newValue,oldValue) {
            	if(!isTreeClick){
            		isChange=true;
            	}
            }
        },
        layout: 'anchor',
        items:[row1,row2,row3,row4,row5,row6,row7,row8]
        //,buttons: ['->', {
        //    text: 'Save'
        //}, {
        //    text: 'Cancel'
        //}]
    });

    return mainFormPanel;
}

function getTreeGridMenu(){

    var delAction = Ext.create('Ext.Action', {
        icon   : '../images/minus.png',  // Use a URL in the icon config
        text: 'Del Sql',
        disabled: false,
        handler: function(widget, event) {
            //var treeStore= Ext.data.StoreManager.lookup('treeStore');

            //var rec = westPanel.getView().getSelectionModel().getSelection()[0];

            var record =  westPanel.getView().getSelectionModel().getSelection()[0];
            record.remove(true);
            treeStore.sync();

            if (record) {
                Ext.Msg.alert('delAction', 'Del ' + record.get('text'));
            }
        }
    });
    var addAction = Ext.create('Ext.Action', {
        //iconCls: 'icon_add',
        icon   : '../images/add.png',  // Use a URL in the icon config
        text: 'Add Sql',
        disabled: false,
        handler: function(widget, event) {
            //var treeStore= Ext.data.StoreManager.lookup('treeStore');

            var rec = westPanel.getView().getSelectionModel().getSelection()[0];
            var add=rec.parentNode.appendChild({leaf:true});
            //After add focus on new node
            westPanel.getView().getSelectionModel().select(treeStore.getNodeById(add.internalId));
            //fill mainPanleData
            var form=mainTabPanel.getForm();
            form.reset();
            form.setValues(treeStore.getNodeById(add.internalId));

            console.log('add.internalId',add.internalId);

            if (rec) {
                Ext.Msg.alert('addAction', 'Add ' + rec.get('text'));
            }
        }
    });

    var toRoot = Ext.create('Ext.Action', {
        //iconCls: 'icon_add',
        //icon   : '../images/add.png',  // Use a URL in the icon config
        text: 'Move To Root',
        disabled: false,
        handler: function(widget, event) {
            var rec = westPanel.getView().getSelectionModel().getSelection()[0];
            if (rec) {
                Ext.Msg.alert('toRoot', 'Buy ' + rec.get('company'));
            }
        }
    });

    var cancelAction = Ext.create('Ext.Action', {
        //iconCls: 'icon_add',
        //icon   : '../images/add.png',  // Use a URL in the icon config
        text: 'Cancel',
        disabled: false,
        handler: function(widget, event) {
            var rec = westPanel.getView().getSelectionModel().getSelection()[0];
            if (rec) {
                Ext.Msg.alert('cancelAction', 'Buy ' + rec.get('company'));
            }
        }
    });
    var refreshAction = Ext.create('Ext.Action', {
        //iconCls: 'icon_add',
        //icon   : '../images/add.png',  // Use a URL in the icon config
        text: 'Refresh',
        disabled: false,
        handler: function(widget, event) {
            var rec = westPanel.getView().getSelectionModel().getSelection()[0];
            if (rec) {
                Ext.Msg.alert('refreshAction', 'Buy ' + rec.get('company'));
            }
        }
    });

    var menu = Ext.create('Ext.menu.Menu', {
        items: [
            addAction,
            delAction
            ,toRoot
            ,cancelAction
            ,refreshAction
        ]
    });

    return menu;
}

/**
 * 清除使用者設定的資料
 */
function cleanSettingStore() {
    //var secondsortStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.SORT + 'Store');
    //var secondfieldStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.FIELD + 'Store');
    //var filterPanelStore = filterPanel.getStore();
    //secondsortStore.loadData([], false);
    //secondfieldStore.loadData([], false);
    //filterPanelStore.loadData([{}], false);
    //Ext.getCmp("excelBtn").disable();
}

function treeClick(treeview, record, element, index, event) {
	isTreeClick=true;
    if (!record.raw.leaf) {
        return;
    }
    var mainVo = record.raw;

    console.log('mainVo:', mainVo);
    console.log(isChange);
    if(isChange){
    	Ext.Msg.confirm("System Information","Data is Changed , do you want to save ? ",function(btn){
    		if("yes"==btn){
    			//do save
    			save();
    			console.log("go save!");
    		}else{
    			console.log("discard save!");
    		}
    		setData(mainVo);
            isChange=false;
    		isTreeClick=false;
    		console.log("isTreeClick=false!");
    	});
    	//Ext.Msg.confirm is transparent, so we need to add return to avoid unexpected code execute
    	return;
    }else{
    	setData(mainVo);
    }
    isTreeClick=false;
}

/**
 * use mainVo data to fill fieldPanel,parameterPanel,mainTabPanel
 * @param mainVo
 */
function setData(mainVo){
	var firstfieldStore = Ext.data.StoreManager.lookup('first' + CONSTANTS.FIELD + 'Store');
    cleanSettingStore();

    //TODO

    if(mainVo.erpPmsQueryFields){
        firstfieldStore.loadData(mainVo.erpPmsQueryFields);
    }

    centerPanel.remove(parameterPanel);
    parameterPanel = getParameterPanel(mainVo.erpPmsQueryPrams);
    centerPanel.add(parameterPanel);
    
    //fill mainPanleData
    var form=mainTabPanel.getForm();
    
    form.reset();
    form.setValues(mainVo);
}

function treeDBClick(grid, rowIndex, e) {
    console.log("treeDBClick", grid);
    console.log("treeDBClick", rowIndex);
    console.log("treeDBClick", e);
}

/**
 * 回傳SQL Tree結構
 * @returns
 */
function getSqlTreeStore() {
    var dataList = [{
        text: "homework",
        expanded: true,
        children: [{
            text: "book report",
            leaf: true
        }, {
            text: "alegrbra",
            leaf: true
        }]
    }, {text: "buy lottery tickets", leaf: true}];
    if (mainList) {
        setTreeText(mainList);
        console.log('after setTreeText', mainList);
        dataList = mainList;
    }

    var store = Ext.create('Ext.data.TreeStore', {
        id:'treeStore',
        root: {
            expanded: true,
            children: dataList
        }
        ,getAt: function (index) {
            var current = 0;
            return (function find(nodes) {
                var i, len = nodes.length;
                for (i = 0; i < len; i++) {
                    if (current === index) {
                        return nodes[i];
                    }
                    current++;
                    var found = find(nodes[i].childNodes);
                    if (found) {
                        return found;
                    }
                }
            }(this.tree.root.childNodes));
        }
        ,findRecord:function (fildName,value) {
            //Return one record only
            var current = 0;
            return (function findRec(nodes) {
                var i, len = nodes.length;
                for (i = 0; i < len; i++) {
                    //console.log("fildName:"+fildName+",value:"+value+",nodes:"+nodes[i][fildName]);
                    if (nodes[i].raw[fildName]==value) {
                        return nodes[i];
                    }
                    current++;
                    var found = findRec(nodes[i].childNodes);
                    if (found) {
                        return found;
                    }
                }
            }(this.tree.root.childNodes));
        }
    });
    return store;
}

/**
 * 將JSP所定義的Json Array補上Tree所需要的資料
 * @param list
 */
function setTreeText(list) {
    for (var i = 0; i < list.length; i++) {
        var main = list[i];
        if (main.children != null) {
            setTreeText(main.children);
        } else {
            main.leaf = true;
        }
        main.text = main.title;
    }
}

function getFilterGridBtns() {
    var dockedItems = [];
    dockedItems.push({
        xtype: 'toolbar',
        items: [{iconCls: 'icon_add', text: 'Add', handler: addFilter}
            , {iconCls: 'icon_minus', text: 'Remove', handler: delFilter}
            //,{iconCls: 'icon-add', text: ' X '}
            //,{iconCls: 'icon-add', text: '↑'}
            //,{iconCls: 'icon-add', text: '↓'}
            , {
                iconCls: 'icon_view',
                text: 'Preview',
                disabled: true,
                itemId: 'delete'
//            ,scope: this,
//            ,handler: this.onDeleteClick
            }]
    });

    return dockedItems;
}

function addFilter() {
    var filterPanelStore = filterPanel.getStore();
    filterPanelStore.add({});
}

function delFilter() {
    var selection = filterPanel.getSelectionModel().getSelection()[0];
    if (selection) {
        var filterPanelStore = filterPanel.getStore();
        filterPanelStore.remove(selection);
    }
}

function apply() {
    var selection = westPanel.getSelectionModel().getSelection()[0];
    if (!selection) {
        alert('No selection.');
        return;
    }
    var mainVo = selection.raw;


    //var secondsortStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.SORT + 'Store');
    //var secondfieldStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.FIELD + 'Store');
    //var filterPanelStore = filterPanel.getStore();
    var parameterPanelStore = parameterPanel.getStore();

    //mainVo.requestFields = getStoreRawDataInArray(secondfieldStore);
    //mainVo.requestSorts = getStoreRawDataInArray(secondsortStore);
    //mainVo.requestFilters = getStoreRawDataInArray(filterPanelStore, true);
    mainVo.requestParameters = getStoreRawDataInArray(parameterPanelStore);

    console.log('reqmainVo', mainVo);

    $.blockUI();
    var url = getAjaxUrl("executeSqlRes");


    var data = "";
//	data +="&ajaxInfo.requestMainVo.treeId="+treeId;
    data = transObjToQueryString("ajaxInfo.requestMainVo", mainVo);
    data += "&" + transArrayObjectToQueryString("ajaxInfo.requestMainVo.requestFields", mainVo.requestFields);
    data += "&" + transArrayObjectToQueryString("ajaxInfo.requestMainVo.requestSorts", mainVo.requestSorts);
    data += "&" + transArrayObjectToQueryString("ajaxInfo.requestMainVo.requestFilters", mainVo.requestFilters);
    data += "&" + transArrayObjectToQueryString("ajaxInfo.requestMainVo.requestParameters", mainVo.requestParameters);

    console.log('getAjaxData.data', data);


    $.ajax({
        type: "POST",
        url: url,
        data: encodeURI(data),
        cache: false,
        dataType: "json",
        success: showValue,
        error: showError
    });


    function showValue(result) {
        console.log('getAjaxData.success.url', url);
        console.log('getAjaxData.success.result', result.ajaxInfo.requestSqlResult);

        if (result.ajaxInfo.requestSqlResult) {
            var grid = getGridStruture(mainVo.requestFields, result.ajaxInfo.requestSqlResult);
            replaceGrid(grid);
        }

        Ext.getCmp("excelBtn").enable();
        $.unblockUI();
    }

    function showError(result) {
        console.log('getAjaxData.showError.url', url);
        console.log('getAjaxData.showError.result', result);
        $.unblockUI();
    }

}

/**
 * @param prefix
 * @param obj
 * @returns {String}
 */
function transObjToQueryString(prefix, obj) {
    var data = "";
    for (var key in obj) {
        if (typeof obj[key] == 'string' && key != 'text') {
            //console.log('key...'+key,typeof mainVo[key]+"..."+mainVo[key]);
            data += "&" + prefix + "." + key + "=" + obj[key];
        }
    }

    return data;
}

/**
 * @param prefix
 * @param array
 * @returns {String}
 */
function transArrayObjectToQueryString(prefix, array) {
    var retStr = "";
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        retStr += transObjToQueryString(prefix + "[" + [i] + "]", obj);
    }
    return retStr;
}

function getStoreRawDataInArray(store, isFilter) {
    var rawDataArray = [];
    for (var i = 0; i < store.data.length; i++) {
        var row = store.getAt(i);
        //For parameter date use
        if (row.data['defValue'] && row.data['defValue'].getFullYear) {
            var year = row.data.defValue.getFullYear();
            var month = row.data.defValue.getMonth() + 1;
            var date = row.data.defValue.getDate();
            store.getAt(i).raw['defValue'] = year + "/" + month + "/" + date;
        }
        if (isFilter) {
            rawDataArray.push(store.getAt(i).data);
        } else {
            rawDataArray.push(store.getAt(i).raw);
        }

    }
    return rawDataArray;
}

function getFieldsPanel() {
    return getDualPanel(CONSTANTS.FIELD);
}

function getSortPanel() {
    return getDualPanel(CONSTANTS.SORT);
}
/**
 * @returns {Array}
 */
function getDualPanel(storeId) {

    var myData = [];

    // create the data store
    var firstGridStore = Ext.create('Ext.data.Store', {
        model: 'DataObject',
        id: 'first' + storeId + 'Store',
        data: myData
    });

    //"treeId","fieldName","originFieldName","seq","displayLabel","dataType","alignment","displayWidth","visible","format","valueList"


    var visibleListStore=Ext.create('Ext.data.Store', {
        id:"visibleListStore",
        fields: ['key', 'value'],
        data   : [{key : 'Y',value: 'Yes'},{key : 'N',value: 'No'}]
    });


    //TODO
    // Column Model shortcut array
    var columns = [
        {text: "SEQ",flex: 1,sortable: true,dataIndex: 'seq', sortType: 'asInt',type:'int',editor:{allowBlank: false}}
        ,{text: "Field Name",flex: 1,sortable: true,dataIndex: 'fieldName',editor:{allowBlank: false}}
        ,{text: "displayLabel",flex: 1,sortable: true,dataIndex: 'displayLabel',editor:{allowBlank: false}}
        ,{text: "originFieldName",flex: 1,sortable: true,dataIndex: 'originFieldName',editor:{allowBlank: false}}
        ,{text: "dataType",flex: 1,sortable: true,dataIndex: 'dataType'
            ,xtype:'gridcolumn'
            ,editor:{
                xtype: 'combobox',
                triggerAction: 'all',
                selectOnTab: true,
                store: Ext.create('Ext.data.Store', {
                    fields : ['key', 'value'],
                    data   : [{key : 'S',value: 'S'},{key : 'I',value: 'I'},{key : 'D',value: 'D'}
                    ]}),
                allowBlank: false,
                editable: false,
                queryMode: 'local',
                displayField: 'key',
                valueField: 'value'
            }}
        ,{text: "alignment",flex: 1,sortable: true,dataIndex: 'alignment'
            ,xtype:'gridcolumn'
            ,editor:{
                xtype: 'combobox',
                triggerAction: 'all',
                selectOnTab: true,
                store: Ext.create('Ext.data.Store', {
                    fields : ['key', 'value'],
                    data   : [{key : 'L',value: 'L'},{key : 'R',value: 'R'}
                    ]}),
                allowBlank: false,
                editable: false,
                queryMode: 'local',
                displayField: 'key',
                valueField: 'value'
            }}
        ,{text: "displayWidth",flex: 1,sortable: true,dataIndex: 'displayWidth',editor:{allowBlank: false}}
        ,{text: "visible",flex: 1,sortable: true,dataIndex: 'visible'
            ,xtype:'gridcolumn'
            ,renderer:function(val){
                var visibleListStore=Ext.data.StoreManager.lookup('visibleListStore');
                var index = visibleListStore.findExact('key',val);
                if (index != -1){
                    var rs = visibleListStore.getAt(index).data;
                    return rs.value;
                }else{
                    return val;
                }
            }
            ,editor:{
                xtype: 'combobox',
                triggerAction: 'all',
                selectOnTab: true,
                store: visibleListStore,
                allowBlank: false,
                editable: false,
                queryMode: 'local',
                displayField: 'value',
                valueField: 'key'
            }}
        ,{text: "format",flex: 1,sortable: true,dataIndex: 'format',editor:{allowBlank: false}}
    ];
    
    addChangeLinster(columns);

    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    // declare the source Grid
    var firstGrid = Ext.create('Ext.grid.Panel', {
        multiSelect: true,
        plugins: [cellEditing],
        store: firstGridStore,
        columns: columns,
        stripeRows: true,
        //title : 'First Grid',
        margins: '0 2 0 0'
    });


    //Simple 'border layout' panel to house both grids
    var displayPanel = Ext.create('Ext.Panel', {
        title: storeId,
        layout: {
            type: 'hbox',
            align: 'stretch',
            padding: 0
        },
        defaults: {
            flex: 1
        }, //auto stretch
        items: [firstGrid]
    });
    return displayPanel;
}

function getFilterPanel() {

    var comboboxStoreAry = [];
    comboboxStoreAry.push(['(', ')']);
    comboboxStoreAry.push(['AA', 'BB', 'CC']);
    comboboxStoreAry.push(['< >', '<', '>', '>=', '<=', '=', 'Like', 'Not Like']);
    comboboxStoreAry.push('FREE');
    comboboxStoreAry.push(['(', ')']);
    comboboxStoreAry.push(['AND', 'OR']);

    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });
    var columns = [];
    for (var i = 0; i < comboboxStoreAry.length; i++) {
        var col = {
            xtype: 'gridcolumn',
//			renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
//		        metaData.tdCls = 'fake-combo';
//		        console.log('record',record);
//		        return value;
//		    },
            id: 'filterCol' + i,
            header: 'Col' + i,
            flex: 1,
            sortable: true,
            dataIndex: 'col' + i
        };


        var editor = {
            id: 'filterComboEditor' + i,
            xtype: 'combobox',
            triggerAction: 'all',
            selectOnTab: true,
            editable: false,
            store: comboboxStoreAry[i],
            lazyRender: true,
            listClass: 'x-combo-list-small'
        };
        //TODO
        if (i == 1) {
            var store = Ext.create('Ext.data.Store', {
                model: 'DataObject',
                id: 'FilterColStore',
                data: []
            });
            editor = {
                id: 'filterComboEditor' + i,
                xtype: 'combobox',
                //typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                store: store,
                editable: false,
                queryMode: 'local',
                displayField: 'displayLabel',
                valueField: 'fieldName',
                listClass: 'x-combo-list-small'
            };
            col.renderer = tRender;
        }

        if ("FREE" != comboboxStoreAry[i]) {
            col.editor = editor;
        } else {
            col.editor = {
                allowBlank: true
            };
        }
        columns.push(col);
    }

    var myData = [{}];

    // create the data store
    var store = Ext.create('Ext.data.Store', {
        model: 'FilterModel',
        data: myData
    });

    var grid = Ext.create('Ext.grid.Panel', {
        title: 'Filter',
        plugins: [cellEditing],
        //height:southPanelHeight,
        //minSize: southPanelHeight,
        //maxSize: 250,
        //cmargins: '5 0 0 0',
//        border: false
//	    store: Ext.data.StoreManager.lookup('employeeStore'),
        store: store,
        dockedItems: getFilterGridBtns(this.store),
        columns: columns
    });
    //return [firstGrid,secondGrid];
    return grid;
}

/**
 * **/
function comboRenderer(combo) {
    return function (value) {
        var record = combo.store.findRecord(combo.valueField, value);
        return record ? record.get(combo.displayField) : combo.valueNotFoundText;
    }
}

function getParameterPanel(parameterList) {
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    var myData;
    if (parameterList) {
        myData = parameterList;
    } else {
        myData = [];
    }

    var paramList=[{key:"@DATE",value:"@DATE"},{key:"@SDATE",value:"@SDATE"},{key:"@EDATE",value:"@EDATE"}];
    var typeList=[{key:"Date",value:"Date"},
            {key:"Date Time",value:"Date Time"},
            {key:"Integer",value:"Integer"},
            {key:"Float",value:"Float"},
            {key:"String",value:"String"}];
    var defaultValueList=[{key:"$Date",value:"$Date"},{key:"$DateTime",value:"$DateTime"},{key:"$Month",value:"$Month"}
        ,{key:"$MonthFirstDay",value:"$MonthFirstDay"},{key:"$MonthLastDay",value:"$MonthLastDay"},{key:"$PriorMonthFirstDay",value:"$PriorMonthFirstDay"}
        ,{key:"$Year",value:"$Year"}
    ];

    var paramCol={text: "Param Name",flex: 1,sortable: true,dataIndex: 'pramName',editor:{allowBlank: false}};
    var labelCol={text: "Label Name",flex: 1,sortable: true,dataIndex: 'label',editor:{allowBlank: false}};
    var dataTypeCol={text: "Data Type",flex: 1,sortable: true,dataIndex: 'pramDataType',editor:{allowBlank: false}};
    var defValueCol={text: "Default Value",flex: 1,sortable: true,dataIndex: 'defValue',editor:{allowBlank: false}};

    paramCol=setGridCombobox(paramCol,"paramCol",paramList);
    dataTypeCol=setGridCombobox(dataTypeCol,"dataTypeCol",typeList);
    defValueCol=setGridCombobox(defValueCol,"defValueCol",defaultValueList);

    //目前只有日期變數，若以後需要增加其他類型，則不可透過Grid呈現，要變成Form的型態
    var columns = [paramCol,labelCol,dataTypeCol,defValueCol];
    addChangeLinster(columns);
    
    // create the data store
    var store = Ext.create('Ext.data.Store', {
        model: 'ParameterModel',
        data: myData
    });

    var grid = Ext.create('Ext.grid.Panel', {
        title: 'Parameter',
        plugins: [cellEditing],
        store: store,
        dockedItems:getParameterPanelBtns(),
        columns: columns
    });
    return grid;
}

/**
 * Add listener to each grid column editor
 * @param columns
 * @returns
 */
function addChangeLinster(columns){
	//Add listener to each grid column editor
    for(var i=0;i<columns.length;i++){
    	if(columns[i].editor){
    		columns[i].editor.listeners={
        			change : function(field, newVal, oldVal) {
        				if(!isTreeClick)isChange=true;
        		    }
        	};
    	}
    }
	return columns;
}

/**
 * reuse
 * **/
function setGridCombobox(comboboxObj,storeId,dataList){

    storeId=storeId+"Store";

    var store=Ext.create('Ext.data.Store', {
        id:storeId,
        fields: ['key', 'value'],
        data   : dataList
    });

    comboboxObj.renderer=function(val){
        var store=Ext.data.StoreManager.lookup(storeId);
        //console.log("store",store);
        var index = store.findExact('key',val);
        if (index != -1){
            var rs = store.getAt(index).data;
            return rs.value;
        }else{
            return val;
        }
    };

    comboboxObj.editor={
        xtype: 'combobox',
        triggerAction: 'all',
        selectOnTab: true,
        store: store,
        allowBlank: false,
        editable: false,
        queryMode: 'local',
        displayField: 'value',
        valueField: 'key'
    };

    return comboboxObj;
}



function getAjaxUrl(methodName) {
    var ajaxUrl = "/Query_Wizard/ajax/maintain!";//savePMInfo.action
    return ajaxUrl + methodName + ".action";
}

/**
 * 複製Object的工具function
 * @param obj
 * @returns
 */
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


function tRender(value) {
    var colStore = Ext.data.StoreManager.lookup('FilterColStore');
    var record = colStore.findRecord('fieldName', value);
    return (record ? record.getData().displayLabel : "");
}
