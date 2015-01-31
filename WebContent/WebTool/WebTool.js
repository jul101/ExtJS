/**
 *
 */

//Ext.require(['*']);

//For Sort And Field Grid Use
Ext.define('DataObject', {
    extend: 'Ext.data.Model',
    fields: ['fieldName', 'displayLabel', 'column1', 'column2']
});

Ext.define('ParameterModel', {
    extend: 'Ext.data.Model',
    fields: ['label', 'defValue']
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
var southPanelHeight = 350;
var gap = 5;
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
var mainPanel, westPanel, southPanel, centerPanel;

var fieldsPanel, filterPanel, sortPanel, parameterPanel;

var container;
Ext.onReady(function () {

    container = document.getElementById("extContainer");

    width = container.style.width == '' ? 800 : parseInt(container.style.width);
    height = container.style.height == '' ? 800 : parseInt(container.style.height);
    fieldsPanel = getFieldsPanel();
    sortPanel = getSortPanel();
    filterPanel = getFilterPanel();
    parameterPanel = getParameterPanel();

//	southPanel={
//		    title: 'Result Grid',
//		    region: 'south',
//		    height:southPanelHeight,
//		    minSize: southPanelHeight,
//		    maxSize: 250,
//		    cmargins: '5 0 0 0'
//		};
    southPanel = getGridStruture();

//	westPanel = {
//		title: 'Tree SQL List',
//		xtype: 'treepanel',
//		store: getSqlTreeStore(),
////	         viewConfig: {
////	             plugins: {
////	                 ptype: 'treeviewdragdrop'
////	             }
////	         },
//		useArrows: true,
//		rootVisible: false,
//		region: 'west', // this is what makes this panel into a region within the containing layout
//		margins: '2 5 5 0',
//		width:westPanelWidth,
//		listeners: {
//			itemclick:treeClick
//		},
//		border: false
//	};

    westPanel = Ext.create('Ext.tree.Panel', {
        title: 'Tree SQL List',
        store: getSqlTreeStore(),
        useArrows: true,
        rootVisible: false,
        region: 'west', // this is what makes this panel into a region within the containing layout
        margins: '2 5 5 0',
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
        tabPosition: 'bottom',
        plain: true,
        dockedItems: getMainBtns(),
        items: [
            fieldsPanel,
            filterPanel,
            sortPanel,
            parameterPanel
            //,{
            //    title: 'Parameter',
            //bodyPadding:10,
            //    html : 'Another one'
            //}
        ]
    });

    mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'PMS Query Wizard - Client(Web)',
        width: width,
        height: height,
        defaults: {
            collapsible: true,
            split: true,
            bodyStyle: 'padding:15px'
        },
        layout: {
            type: 'border',
            padding: 5
        },
        items: [westPanel, southPanel, centerPanel],
        renderTo: container
    });
});

/**
 * 清除使用者設定的資料
 */
function cleanSettingStore() {
    var secondsortStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.SORT + 'Store');
    var secondfieldStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.FIELD + 'Store');
    var filterPanelStore = filterPanel.getStore();
    secondsortStore.loadData([], false);
    secondfieldStore.loadData([], false);
    filterPanelStore.loadData([{}], false);
    Ext.getCmp("excelBtn").disable();
}

function treeClick(treeview, record, element, index, event) {
    //for(var key in arguments){
    //	console.log('arguments:'+key,arguments[key]);
    //}
    if (!record.raw.leaf) {
        return;
    }
    var mainVo = record.raw;

    var firstsortStore = Ext.data.StoreManager.lookup('first' + CONSTANTS.SORT + 'Store');
    var firstfieldStore = Ext.data.StoreManager.lookup('first' + CONSTANTS.FIELD + 'Store');
    var filterCol1Store = Ext.data.StoreManager.lookup('FilterColStore');
    cleanSettingStore();

    //TODO

    filterCol1Store.loadData(clone(mainVo.erpPmsQueryFields));
    firstsortStore.loadData(clone(mainVo.erpPmsQueryFields));
    firstfieldStore.loadData(mainVo.erpPmsQueryFields);
    centerPanel.remove(parameterPanel);
    parameterPanel = getParameterPanel(mainVo.erpPmsQueryPrams);
    centerPanel.add(parameterPanel);

    console.log('mainVo:', mainVo);
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
        root: {
            expanded: true,
            children: dataList
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

function getGridStruture(requestFields, sqlResultList) {

    var columns = [];
    var store;

    if (sqlResultList && sqlResultList.length != 0) {
        columns = [];
        for (var i = 0; i < requestFields.length; i++) {
            var col = requestFields[i];
            columns.push({
                header: col.displayLabel
                , dataIndex: col.fieldName
                , flex: 1
            });
        }
        store = getGridStore(columns, sqlResultList)
    } else {
        store = getGridStore();
    }

    var grid = Ext.create('Ext.grid.Panel', {
        title: 'Result Grid',
        region: 'south',
        height: southPanelHeight,
        minSize: southPanelHeight,
        maxSize: 250,
        cmargins: '5 0 0 0',
//        border: false
//	    store: Ext.data.StoreManager.lookup('employeeStore'),
        store: store,
        dockedItems: getGridBtns(this.store),
        columns: columns
    });
    return grid;
}

function getGridStore(columns, sqlResultList) {
    var store;
    if (columns && sqlResultList.length != 0) {

        var fields = [];
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            fields.push(col.dataIndex);
        }

        store = Ext.create('Ext.data.Store', {
            storeId: 'sqlGridStore',
            fields: fields,
            data: {'items': sqlResultList},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });
    } else {
        store = Ext.create('Ext.data.Store', {
            storeId: 'sqlGridStore',
            fields: [],
            data: {'items': []},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });
    }


    return store;
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

/**
 * 產生下方的按鈕，包含分頁
 * @param store
 * @returns {Array}
 */
function getGridBtns() {
    var dockedItems = [];
    dockedItems.push({
        xtype: 'toolbar',
        items: [
            {
                iconCls: 'icon_xls',
                text: 'Excel',
                disabled: true,
                id: 'excelBtn'
//            ,scope: this,
                , handler: genExcel
            }]
    });
    dockedItems.push({
        xtype: 'pagingtoolbar',
        store: Ext.data.StoreManager.lookup('sqlGridStore'),
        dock: 'bottom',
        displayInfo: true
    });

    return dockedItems;
}

function apply() {
    var selection = westPanel.getSelectionModel().getSelection()[0];
    if (!selection) {
        alert('No selection.');
        return;
    }
    var mainVo = selection.raw;


    var secondsortStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.SORT + 'Store');
    var secondfieldStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.FIELD + 'Store');
    var filterPanelStore = filterPanel.getStore();
    var parameterPanelStore = parameterPanel.getStore();

    mainVo.requestFields = getStoreRawDataInArray(secondfieldStore);
    mainVo.requestSorts = getStoreRawDataInArray(secondsortStore);
    mainVo.requestFilters = getStoreRawDataInArray(filterPanelStore, true);
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
        //TODO
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

function getMainBtns() {
    var dockedItems = [{
        xtype: 'toolbar',
        items: [{
            iconCls: 'icon_yes',
            text: 'Apply'
//            ,scope: this
            , handler: apply
        }
//		,{
//			iconCls: 'icon-add',
//			text: 'Excel'
////            ,scope: this
////            ,handler: this.onAddClick
//		}
//			, {
//				iconCls: 'icon_save',
//				text: 'Save',
//				disabled: true,
//				itemId: 'delete'
//			}
        ]
    }];
    return dockedItems;
}


/**
 * 替換Grid
 * replaceGrid(getGridStrutureEx())
 * replaceGrid(getGridStruture())
 * @param newPanel
 */
function replaceGrid(newPanel) {
    mainPanel.remove(southPanel);
    southPanel = newPanel;
    mainPanel.add(southPanel);
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

    // Column Model shortcut array
    var columns = [{
        text: "Field Name",
        flex: 1,
        sortable: false,
        dataIndex: 'displayLabel'
    }
        //	, {
        //	text : "column1",
        //	width : 70,
        //	sortable : true,
        //	dataIndex : 'column1'
        //}, {
        //	text : "column2",
        //	width : 70,
        //	sortable : true,
        //	dataIndex : 'column2'
        //}
    ];

    var sortColumns = [{
        text: "Field Name",
        flex: 1,
        sortable: false,
        renderer: function (value) {
            return '<img src="../images/sort-asc.gif" class="asc" />' + value;
        },
        dataIndex: 'displayLabel'
    }];

    // declare the source Grid
    var firstGrid = Ext.create('Ext.grid.Panel', {
        multiSelect: true,
        viewConfig: {
            plugins: {
                ptype: 'gridviewdragdrop',
                dragGroup: 'firstGridDDGroup',
                dropGroup: 'secondGridDDGroup'
            },
            listeners: {
                drop: function (node, data, dropRec, dropPosition) {
                    var dropOn = dropRec ? ' ' + dropPosition + ' '
                    + dropRec.get('name') : ' on empty view';
                    console.log("Drag from right to left", 'Dropped '
                    + data.records[0].get('name') + dropOn);
                }
            }
        },
        store: firstGridStore,
        columns: columns,
        stripeRows: true,
        //title : 'First Grid',
        margins: '0 2 0 0'
    });

    var secondGridStore = Ext.create('Ext.data.Store', {
        id: "second" + storeId + "Store",
        model: 'DataObject'
    });

    // create the destination Grid
    var secondGrid = Ext.create('Ext.grid.Panel', {
        viewConfig: {
            plugins: {
                ptype: 'gridviewdragdrop',
                dragGroup: 'secondGridDDGroup',
                dropGroup: 'firstGridDDGroup'
            },
            listeners: {
                drop: function (node, data, dropRec, dropPosition) {
                    var dropOn = dropRec ? ' ' + dropPosition + ' '
                    + dropRec.get('name') : ' on empty view';
                    console.log("Drag from left to right", 'Dropped '
                    + data.records[0].get('name') + dropOn);
                }
            }
        },
        store: secondGridStore,
        columns: (storeId == "Sort" ? sortColumns : columns),
        stripeRows: true,
        //title : 'Second Grid',
        listeners: {
            itemdblclick: sortItemDblClick
        },
        margins: '0 0 0 3'
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
        items: [firstGrid, secondGrid],
        dockedItems: {
            xtype: 'toolbar',
            dock: 'bottom',
            items: ['->', // Fill
                {
                    text: 'Reset both grids',
                    handler: function () {

                        var selection = westPanel.getSelectionModel().getSelection()[0];
                        if (!selection) {
                            alert('No selection.');
                            return;
                        }
                        var mainVo = selection.raw;

                        var newColList = [];
                        for (var i = 0; i < mainVo.erpPmsQueryFields.length; i++) {
//							newColList.push({field1:mainVo.erpPmsQueryFields[i]['displayLabel']});
                            newColList.push(mainVo.erpPmsQueryFields[i]);
                        }

                        //console.log('newColList',newColList);


                        //refresh source grid
                        firstGridStore.loadData(clone(mainVo.erpPmsQueryFields));

                        //purge destination grid
                        secondGridStore.removeAll();
                    }
                }]
        }
    });
    //return [firstGrid,secondGrid];
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
    var columns;

    if (parameterList) {
        for (var i = 0; i < parameterList.length; i++) {
            //parameterList[i].pramName=parameterList[i].label;
            if (parameterList[i].defValue == CONSTANTS.monthFirstDay) {
                parameterList[i].defValue = monthFirstDay;
            } else if (parameterList[i].defValue == CONSTANTS.monthLastDay) {
                parameterList[i].defValue = monthLastDay;
            } else if (parameterList[i].defValue == CONSTANTS.priorMonthFirstDay) {
                parameterList[i].defValue = priorMonthFirstDay;
            } else if (parameterList[i].defValue == CONSTANTS.priorMonthLastDay) {
                parameterList[i].defValue = priorMonthLastDay;
            } else if (parameterList[i].defValue == CONSTANTS.systemdate) {
                parameterList[i].defValue = systemdate;
            }
            console.log('defValue', parameterList[i].defValue);
        }
        myData = parameterList;
    } else {
        myData = [];
    }

    //目前只有日期變數，若以後需要增加其他類型，則不可透過Grid呈現，要變成Form的型態
    columns = [{
        header: 'Variable',
        flex: 1,
        sortable: true,
        dataIndex: 'label'
        //,editor:{allowBlank: true}
    }, {
        // column 2 - DATE
        xtype: 'datecolumn',
        header: 'Value',
        dataIndex: 'defValue',
        flex: 1,
//		renderer: Ext.util.Format.dateRenderer('d/m/Y H:i'),
//		format: 'Y-m-d',
        editor: {
            xtype: 'datefield',
            allowBlank: false,
            format: 'Y-m-d'
        }
    }
    ];


    // create the data store
    var store = Ext.create('Ext.data.Store', {
        model: 'ParameterModel',
        data: myData
    });

    var grid = Ext.create('Ext.grid.Panel', {
        title: 'Parameter',
        plugins: [cellEditing],
        store: store,
        //dockedItems:getGridBtns(this.store),
        columns: columns
    });
    return grid;
}

function getParameterPanelX() {
    var defValueStore = Ext.create('Ext.data.Store', {
        fields: ['label', 'value'],
        data: [
            {label: "$PriorMonthFirstDay", value: "$PriorMonthFirstDay"},
            {label: "$PriorMonthLastDay", value: "$PriorMonthLastDay"},
            {label: "2015/1/1", value: "$MonthFirstDay"},
            {label: "2015/1/31", value: "$MonthLastDay"},
            {label: "$Date", value: "$Date"}
        ]
    });

    var comboEditor = {
        xtype: 'combobox',
        //typeAhead: true,
        //triggerAction: 'all',
        //selectOnTab: true,
        displayField: 'label',
        valueField: 'value',
        store: defValueStore,
        lazyRender: true,
        listClass: 'x-combo-list-small'
    };

    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    var columns = [{
        header: 'Variable',
        flex: 1,
        sortable: true,
        dataIndex: 'pramName', editor: {
            allowBlank: true
        }
    }, {
        header: 'Value',
        flex: 1,
        sortable: true,
        dataIndex: 'defValue',
        renderer: comboRenderer(comboEditor),
        editor: comboEditor
    }
    ];

    var myData = [{pramName: '截止日期', defValue: '$MonthLastDay'}
        , {pramName: '起始日期', defValue: '$MonthFirstDay'}
    ];

    // create the data store
    var store = Ext.create('Ext.data.Store', {
        model: 'FilterModel',
        data: myData
    });

    var grid = Ext.create('Ext.grid.Panel', {
        title: 'Parameter',
        plugins: [cellEditing],
        store: store,
        //dockedItems:getGridBtns(this.store),
        columns: columns
    });
    return grid;
}

function getAjaxData(treeId) {
    $.blockUI();
    var data = "";
    data += "&ajaxInfo.mainVo.treeId=" + treeId;
//	data +="&ajaxInfo.mainVo.processIndex="+$("#fundryProcess").val();

    console.log('getAjaxData.data', data);

    var url = getAjaxUrl("execute");

    $.ajax({
        type: "POST",
        url: url,
        data: data,
        cache: false,
        dataType: "json",
        success: showValue,
        error: showError
    });

    function showValue(result) {
        console.log('getAjaxData.success.url', url);
        console.log('getAjaxData.success.data', data);
        console.log('getAjaxData.success.result', result);
        $.unblockUI();
    }

    function showError(result) {
        console.log('getAjaxData.showError.url', url);
        console.log('getAjaxData.showError.data', data);
        console.log('getAjaxData.showError.result', result);

        $.unblockUI();
    }
}

function getAjaxUrl(methodName) {
    var ajaxUrl = "/Query_Wizard/ajax/maintain!";//savePMInfo.action
    return ajaxUrl + methodName + ".action";
}

/**
 * 顯示排序
 * @param dv
 * @param record
 * @param item
 * @param index
 * @param e
 */
function sortItemDblClick(dv, record, item, index, e) {
    var img = $(item)[0].getElementsByTagName("img")[0];
    var cls = img.getAttribute("class");
    if (cls == null || cls == "asc") {
        img.src = "../images/sort-desc.gif";
        img.setAttribute("class", "desc");
        record.data.fieldName = record.data.fieldName.split(" ")[0] + " " + "desc";
        record.raw.fieldName = record.data.fieldName.split(" ")[0] + " " + "desc";
    } else {
        img.src = "../images/sort-asc.gif";
        img.setAttribute("class", "asc");
        record.data.fieldName = record.data.fieldName.split(" ")[0] + " " + "asc";
        record.raw.fieldName = record.data.fieldName.split(" ")[0] + " " + "asc";
    }
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

var downWin;
function genExcel() {
    //http://ftcosdev1.faraday.com.tw/Query_Wizard/main/queryWizard!genExcel.action?
    var url = "/Query_Wizard/main/queryWizard!genExcel.action";

    var selection = westPanel.getSelectionModel().getSelection()[0];
    if (!selection) {
        alert('No selection.');
        return;
    }
    var mainVo = selection.raw;


    var secondsortStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.SORT + 'Store');
    var secondfieldStore = Ext.data.StoreManager.lookup('second' + CONSTANTS.FIELD + 'Store');
    var filterPanelStore = filterPanel.getStore();
    var parameterPanelStore = parameterPanel.getStore();

    mainVo.requestFields = getStoreRawDataInArray(secondfieldStore);
    mainVo.requestSorts = getStoreRawDataInArray(secondsortStore);
    mainVo.requestFilters = getStoreRawDataInArray(filterPanelStore, true);
    mainVo.requestParameters = getStoreRawDataInArray(parameterPanelStore);

    console.log('reqmainVo', mainVo);

    $.blockUI();

    var data = "";
//	data +="&ajaxInfo.requestMainVo.treeId="+treeId;
    data = transObjToQueryString("master.requestMainVo", mainVo);
    data += "&" + transArrayObjectToQueryString("master.requestMainVo.requestFields", mainVo.requestFields);
    data += "&" + transArrayObjectToQueryString("master.requestMainVo.requestSorts", mainVo.requestSorts);
    data += "&" + transArrayObjectToQueryString("master.requestMainVo.requestFilters", mainVo.requestFilters);
    data += "&" + transArrayObjectToQueryString("master.requestMainVo.requestParameters", mainVo.requestParameters);

    console.log("url", url + "?" + data);
    downWin = window.open(url + "?" + data, "downWin", "width=940, height=500, left="
    + (screen.width / 8 ) + ", top=" + (screen.height / 8 ) + ", scrollbars=yes, resizable=yes, status=1");
    $.unblockUI();
}

function tRender(value) {
    var colStore = Ext.data.StoreManager.lookup('FilterColStore');
    var record = colStore.findRecord('fieldName', value);
    return (record ? record.getData().displayLabel : "");
}
