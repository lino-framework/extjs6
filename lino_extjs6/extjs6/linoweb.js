/*
 Copyright 2009-2017 Luc Saffre
 License: BSD (see file COPYING for details)
*/

{{ext_renderer.linolib_intro()}}

// hack to add a toCamel function, inspired by
// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
String.prototype.toCamel = function(){
  //~ return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
  //~ return this;
  return this.replace(/([A-Z])([A-Z]+)/g, function(match,p1,p2,offset,string){
      //~ console.log("20131005 got ",arguments);
      return p1 + p2.toLowerCase();});
};

/**
 * Ext.form.field.ComboBox crashes unexpectedly when more than one combo with paging presented on the
 * same physical page in the browser:
 * Ext.ComponentManager.register(): Registering duplicate component id "undefined-paging-toolbar"
 *
 * Solution: just comment nonexistent pickerId when component boundlist creates. Since this pickerId is
 * nowhere used this should be okay and Ext.Component will make sure about unique identifier by itself.
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?303101
 */

Ext.define('Jarvus.hotfixes.form.field.ComboBoxPickerId', {
    override: 'Ext.form.field.ComboBox',

    createPicker: function() {
        var me = this,
            picker,
            pickerCfg = Ext.apply({
                xtype: 'boundlist',
                pickerField: me,
                selectionModel: me.pickerSelectionModel,
                floating: true,
                hidden: true,
                store: me.getPickerStore(),
                displayField: me.displayField,
                preserveScrollOnRefresh: true,
                pageSize: me.pageSize,
                tpl: me.tpl
            }, me.listConfig, me.defaultListConfig);

        picker = me.picker = Ext.widget(pickerCfg);
        if (me.pageSize) {
            picker.pagingToolbar.on('beforechange', me.onPageChange, me);
        }

        // We limit the height of the picker to fit in the space above
        // or below this field unless the picker has its own ideas about that.
        if (!picker.initialConfig.maxHeight) {
            picker.on({
                beforeshow: me.onBeforePickerShow,
                scope: me
            });
        }
        picker.getSelectionModel().on({
            beforeselect: me.onBeforeSelect,
            beforedeselect: me.onBeforeDeselect,
            focuschange: me.onFocusChange,
            scope: me
        });

        picker.getNavigationModel().navigateOnSpace = false;

        return picker;
    },
});

//init: function () {
// https://docs.sencha.com/extjs/6.0/wh...de.html#Button
//    https://www.sencha.com/forum/showthread.php?303936-Button-issue-with-WAI-ARIA
//Ext.enableAriaButtons = false;
//Ext.enableAriaPanels = false;
//};
Ext.define('AppsBoard.Application', {
    extend: 'Ext.app.Application',

    name: 'AppsBoard',

    stores: [
        // TODO: add global / shared stores here
    ],

    launch: function () {
        // TODO - Launch the application
    },
    init: function () {
    // https://docs.sencha.com/extjs/6.0/wh...de.html#Button
      //  https://www.sencha.com/forum/showthread.php?303936-Button-issue-with-WAI-ARIA
        Ext.enableAriaButtons = false;
        Ext.enableAriaPanels = false;
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});


/* Ext.form.field.Month: thanks to Igor Semin @ sencha forum
   http://stackoverflow.com/questions/28167452/date-picker-year-and-month-only
   and
   http://stackoverflow.com/questions/28197217/month-field-on-extjs-5-1
*/
Ext.onReady(function() {
    Ext.define('Ext.form.field.Month', {
        extend: 'Ext.form.field.Date',
        alias: 'widget.monthfield',
        requires: ['Ext.picker.Month'],
        alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
        selectMonth: null,
        createPicker: function() {
            var me = this,
                format = Ext.String.format;
            return Ext.create('Ext.picker.Month', {
                pickerField: me,
                ownerCt: me.ownerCt,
                renderTo: document.body,
                floating: true,
                hidden: true,
                focusOnShow: true,
                minDate: me.minValue,
                maxDate: me.maxValue,
                disabledDatesRE: me.disabledDatesRE,
                disabledDatesText: me.disabledDatesText,
                disabledDays: me.disabledDays,
                disabledDaysText: me.disabledDaysText,
                format: me.format,
                showToday: me.showToday,
                startDay: me.startDay,
                minText: format(me.minText, me.formatDate(me.minValue)),
                maxText: format(me.maxText, me.formatDate(me.maxValue)),
                listeners: {
                    select: {
                        scope: me,
                        fn: me.onSelect
                    },
                    monthdblclick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    yeardblclick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    OkClick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    CancelClick: {
                        scope: me,
                        fn: me.onCancelClick
                    }
                },
                keyNavConfig: {
                    esc: function() {
                        me.collapse();
                    }
                }
            });
        },
        onCancelClick: function() {
            var me = this;
            me.selectMonth = null;
            me.collapse();
        },
        onOKClick: function() {
            var me = this;
            if (me.selectMonth) {
                me.setValue(me.selectMonth);
                me.fireEvent('select', me, me.selectMonth);
            }
            me.collapse();
        },
        onSelect: function(m, d) {
            var me = this;
            me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
        }
    });

    //Ext.create('Ext.form.field.Month', {
    //    format: 'F, Y',
    //    fieldLabel: 'Date',
    //    renderTo: Ext.getBody()
    //});
});

//Ext.preg('monthPickerPlugin', Ext.form.field.Month);

// Ticket 1959 Column widths change on layout flush
Ext.define('Ext.fix.layout.container.Box', {
    override: 'Ext.layout.container.Box',

    roundFlex: function(width) {
        return Math.round(width);
    }
});

/**
JC Watsons solution (adapted to ExtJS 3.3.1 by LS) is elegant and simple:
`A "fix" for unchecked checkbox submission  behaviour
<http://www.sencha.com/forum/showthread.php?28449>`_

Added special handling for checkbox inputs. 
ExtJS defines disabled checkboxes `readonly`, not `disabled` as for other inputs.

*/
// editef by HKC (Migratio to Exjts6)
//Ext.lib.Ajax.serializeForm = function(form) {
Ext.Ajax.serializeForm = function(form) {
    //~ console.log('20120203 linolib.js serializeForm',form);
    var fElements = form.elements || (document.forms[form] || Ext.getDom(form)).elements,
        hasSubmit = false,
        encoder = encodeURIComponent,
        name,
        data = '',
        type,
        hasValue;

    Ext.each(fElements, function(element){
        name = element.name;
        type = element.type;

        if (!element.disabled && name && !(type == 'checkbox' && element.readonly)) {
            if (/select-(one|multiple)/i.test(type)) {
                Ext.each(element.options, function(opt){
                    if (opt.selected) {
                        hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                        data += String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                    }
                });
            } else if (!(/file|undefined|reset|button/i.test(type))) {
                //~ if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                if (!(type == 'submit' && hasSubmit)) {
                    if (type == 'checkbox') {
                        //~ console.log('20111001',element,'data += ',encoder(name) + '=' + (element.checked ? 'on' : 'off') + '&');
                        data += encoder(name) + '=' + (element.checked ? 'on' : 'off') + '&';
                    } else {
                        //~ console.log('20111001',element,'data += ',encoder(name) + '=' + encoder(element.value) + '&');
                        data += encoder(name) + '=' + encoder(element.value) + '&';
                    }
                    hasSubmit = /submit/i.test(type);
                }
            }
        //~ } else {
            //~ console.log(name,type,element.readonly);
        }
    });
    return data.substr(0, data.length - 1);
};



/*
Set a long timeout of fifteen minutes. 
See /blog/2012/0307
*/
Ext.Ajax.timeout = 15 * 60 * 1000; 

/*
 * Thanks to 
 * `huuze <http://stackoverflow.com/users/10040/huuuze>`_ for the question
 * and to 
 * `chrisv <http://stackoverflow.com/users/683808/chrisv>`_
 * for the answer on
 * http://stackoverflow.com/questions/3764589/how-do-i-include-django-1-2s-csrf-token-in-a-javascript-generated-html-form/5485616#5485616
 * 
 * */
 
Ext.Ajax.on('beforerequest', function (conn, options) {
   if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
     if (typeof(options.headers) == "undefined") {
       options.headers = {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')};
     } else {
       options.headers.extend({'X-CSRFToken': Ext.util.Cookies.get('csrftoken')});
     }                        
   }
}, this);

Ext.define('Ext.grid.ViewDropZone', {
    override: 'Ext.grid.ViewDropZone',
    handleNodeDrop: function(data, record, position) {
        var view = this.view,
            store = view.getStore(),
            crossView = view !== data.view,
            index, records, i, len;
        // If the copy flag is set, create a copy of the models
        if (data.copy) {
            records = data.records;
            for (i = 0 , len = records.length; i < len; i++) {
                records[i] = records[i].copy();
            }
        } else if (crossView) {
            /*
             * Remove from the source store only if we are moving to a different store.
             */
            data.view.store.remove(data.records);
        }
        if (record && position) {

            /*
            * Need to switch the data of the two records.
            * Send an Ajax PUT request to update the selected row
            * Update the sorting INT for all rows
            *
            * Might be better to just save the row with the requested position.
            */

            index = store.indexOf(record); // original
            var r = data.records[0];
            var c = {
                grid: view.grid,
                record: r,
                field: view.grid.viewConfig.plugins.sequenced_field,
                originalValue: r.data.seqno,
                value: r.data.seqno,
                cancel: false
            };
            // 'after', or undefined (meaning a drop at index -1 on an empty View)...
            r.data[c.field]= record.data[c.field];
            if (position !== 'before') { // orginal
                index++;
                r.data[c.field]++; // new
            }
            c.value = r.data[c.field];
            view.grid.on_beforeedit(null, c);
            if (!c.cancel){
                r.modified = {};
                r.modified[c.field] =  c.originalValue;
                view.grid.store.on('load', view.grid.ensureVisibleRecord, view.grid,
                              {row:index}
                               /*,column:status.focus.column}*/);
                view.grid.on_afteredit(null,c);

            }

//            store.insert(index, data.records); // original
        } else // No position specified - append.
        {
            store.add(data.records);
        }
        // Select the dropped nodes unless dropping in the same view.
        // In which case we do not disturb the selection.
        if (crossView) {
            view.getSelectionModel().select(data.records);
        }
        // Focus the first dropped node.
        view.getNavigationModel().setPosition(data.records[0]);
    }
});



/*
My fix for the "Cannot set QuickTips dismissDelay to 0" bug,
see http://www.sencha.com/forum/showthread.php?183515 
*/
//Edited by HKC
//Ext.override(Ext.QuickTip,{
//Ext.define('Lino.QuickTip', {
//    override : 'Ext.QuickTip',
//  showAt : function(xy){
//        var t = this.activeTarget;
        //~ console.log("20120224 QuickTip.showAt",this.title,this.dismissDelay,t.dismissDelay);
        //if(t){
        //    if(!this.rendered){
        //        this.render(Ext.getBody());
        //        this.activeTarget = t;
        //    }
        //    if(t.width){
        //        this.setWidth(t.width);
        //        this.body.setWidth(this.adjustBodyWidth(t.width - this.getFrameWidth()));
        //        this.measureWidth = false;
        //    } else{
        //        this.measureWidth = true;
        //    }
        //    this.setTitle(t.title || '');
        //    this.body.update(t.text);
        //    this.autoHide = t.autoHide;
        //     bugfix by Luc 20120226
        //    if (t.dismissDelay != undefined) this.dismissDelay = t.dismissDelay;
        //    ~ this.dismissDelay = t.dismissDelay || this.dismissDelay;
        //    if(this.lastCls){
        //        this.el.removeClass(this.lastCls);
        //        delete this.lastCls;
        //    }
        //    if(t.cls){
        //        this.el.addClass(t.cls);
        //        this.lastCls = t.cls;
        //    }
        //    if(this.anchor){
        //        this.constrainPosition = false;
        //    }else if(t.align){
        //        xy = this.el.getAlignToXY(t.el, t.align);
        //        this.constrainPosition = false;
        //    }else{
        //        this.constrainPosition = true;
        //    }
        //}
        //Ext.QuickTip.superclass.showAt.call(this, xy);
       //this.callSuper([xy]);
    //}
//});


Ext.namespace('Lino');
    
    

//~ Lino.subst_user_field = new Ext.form.ComboBox({});
//~ Lino.subst_user = null;
Lino.insert_subst_user = function(p){
    //~ console.log('20120714 insert_subst_user',Lino.subst_user,p);
    //~ if (Lino.subst_user_field.getValue()) {
    if (p.{{constants.URL_PARAM_SUBST_USER}}) return;
    if (Lino.subst_user) {
        //~ p.{{constants.URL_PARAM_SUBST_USER}} = Lino.subst_user_field.getValue();
        p.{{constants.URL_PARAM_SUBST_USER}} = Lino.subst_user;
    //~ } else {
        //~ delete p.{{constants.URL_PARAM_SUBST_USER}};
    }
    //~ console.log('20120714 insert_subst_user -->',Lino.subst_user,p);
}

{% if extjs.autorefresh_seconds -%}
Lino.autorefresh = function() {
  if (Lino.current_window == null) {
      Lino.viewport.refresh();
      //HKC
      //Lino.autorefresh.defer({{extjs.autorefresh_seconds*1000}});
      Ext.defer(function() {
           Lino.autorefresh();
        },  {{extjs.autorefresh_seconds*1000}}) ;
  }
}
{%- endif %}

Lino.set_subst_user = function(id, name) {
    //~ console.log(20130723,'Lino.set_subst_user',id,name,Lino.current_window,Lino.viewport);
    Lino.subst_user = id;
    if (Lino.current_window) 
        Lino.current_window.main_item.set_base_param("{{constants.URL_PARAM_SUBST_USER}}",id);
    if (Lino.viewport) 
        Lino.permalink_handler(Lino.current_window)();
};



//~ Lino.select_subst_user = function(cmp,rec,value){
    //~ Lino.subst_user=value;
    //~ console.log(20120713,rec);
//~ }
    
Lino.current_window = null;
Lino.window_history = Array();
    
Lino.chars2width = function(cols) {  return cols * 9; };
Lino.rows2height = function(cols) {  return cols * 20; };
Lino.perc2width = function(perc) {
    // var w = Math.max(document.documentElement.clientWidth, window.innerWidth);
    // console.log("20151226", document, window, w);
    var w = Lino.viewport.getWidth();
    return w * perc / 100;
};


// HKC
//Lino.MainPanel = {
Ext.define('Lino.MainPanel',{
    extend: 'Ext.panel.Panel',
  is_home_page : false,
  auto_apply_params: true,
  setting_param_values : false,
  config_containing_window : function(cls, wincfg) { }
  ,init_containing_window : function(win) { }
  ,is_loading : function() {
      if (!this.rendered) return true;
      //~ return (Ext.select('.x-loading-msg').elements.length > 0);
      return true;
    }
  ,do_when_clean : function(auto_save,todo) { todo() }
  ,get_master_params : function() {
    var p = {};
    p['{{constants.URL_PARAM_MASTER_TYPE}}'] = this.content_type;
    rec = this.get_current_record();
    if (rec) {
      if (rec.phantom) {
          p['{{constants.URL_PARAM_MASTER_PK}}'] = undefined;
      }else{
          p['{{constants.URL_PARAM_MASTER_PK}}'] = rec.id;
      }
    } else {
      p['mk'] = undefined;
    }
    //~ console.log('get_master_params returns',p,'using record',rec);
    return p;
  }
  ,get_permalink : function() {
    var p = Ext.apply({}, this.get_base_params());
    delete p.fmt;
    Ext.apply(p, this.get_permalink_params());

    if (this.toggle_params_panel_btn) {
        p.{{constants.URL_PARAM_SHOW_PARAMS_PANEL}} = this.toggle_params_panel_btn.pressed;
        //~ if (this.toggle_params_panel_btn.pressed == this.params_panel_hidden) {
          //~ p.{{constants.URL_PARAM_SHOW_PARAMS_PANEL}} = true;
        //~ }
    }

    //~ Lino.insert_subst_user(p);
     //~ p.fmt = 'html';
    //~ console.log('get_permalink',p,this.get_permalink_params());
    if (this.is_home_page)
        //~ var url = '';
        var url = '{{extjs.build_plain_url()}}';
    else
        var url = this.get_permalink_url();
    if (p.{{constants.URL_PARAM_SUBST_USER}} == null)
        delete p.{{constants.URL_PARAM_SUBST_USER}};
    if (Ext.urlEncode(p)) url = url + "?" + Ext.urlEncode(p);
    return url;
  }
  ,get_record_url : function(record_id) {
      var url = '{{extjs.build_plain_url("api")}}' + this.ls_url
      //~ var url = this.containing_window.config.url_data; // ls_url;
      url += '/' + (record_id === undefined ?  this.default_record_id : String(record_id));
      //~ if (record_id !== undefined) url += '/' + String(record_id);
      //~ url += '/' + String(record_id);
      return url;
  }
  ,get_permalink_url : function() {
      return '{{extjs.build_plain_url("api")}}' + this.ls_url;
  }
  ,get_permalink_params : function() {
      //~ return {an:'grid'};
      var p = {};
      if (this.action_name)
          p.{{constants.URL_PARAM_ACTION_NAME}} = this.action_name;
      this.add_param_values(p,false)
      return p;
  }
  /*

  Lino.MainPanel.set_status() : the status can have the following keys:

  - param_values : values of parameter fields
  - field_values : values of action parameter fields
  - base_params
  - record_id
  - active_tab
  - data_record
  - show_params_panel
  - current_page

   */
  ,set_status : function(status, requesting_panel) {}
  ,get_status : function() { return {}}
  ,refresh : function() {}
  ,get_base_params : function() {  // Lino.MainPanel
    var p = {};
    Lino.insert_subst_user(p);
    return p;
  }
  ,add_params_panel : function (tbar) {
      // console.log("20160701 Lino.MainPanel.add_params_panel()")
      if (this.params_panel) {
        //~  20130923b
        //~ this.params_panel.autoHeight = true; // 20130924
        var t = this;
        var update = function() {
            var p = t.params_panel;
            //~ console.log("update", p.getSize().height,p.forceLayout,p.autoHeight);
            var w = t.get_containing_window();
            Lino.do_when_visible(w, function() {
                //~ p.doLayout(true); // doLayout(shallow, force)
                //w.doLayout(true); // doLayout(shallow, force)
                // HKC , disable doLayout function
                //~ t.params_panel.on('afterlayout',update,t,{single:true});
            });
        };
        Lino.do_when_visible(this.params_panel, update);
        this.params_panel.on('show',update);
        this.params_panel.on('hide',update);
        //~ this.params_panel.on('bodyresize',update);
        this.params_panel.on('afterlayout',update);
        //~ this.params_panel.on('afterlayout',update,this,{single:true});
        //~ this.params_panel.on('bodyresize',update,this,{single:true});
        //~ this.params_panel.on('resize',update,this,{single:true});
        //~ this.params_panel.on('render',update,this,{single:true});

        // this.params_panel.on('render',
        //~ this.params_panel.on('afterlayout',update,this,{single:true,delay:200});
        //~ this.params_panel.on('bodyresize',update,this,{single:true,delay:200});
        this.toggle_params_panel_btn = Ext.create('Ext.Button',{ scope:this,
          //~ text: "$_("[parameters]")", // gear
          iconCls: 'x-tbar-database_gear',
          tooltip:"{{_('Show or hide the table parameters panel')}}",
          enableToggle: true,
          //~ pressed: ! this.params_panel.hidden,
          pressed: ! this.params_panel_hidden,
          toggleHandler: function(btn,state) {
            //~ console.log("20120210 add_params_panel",state,this.params_panel);
            if (state) {
                this.params_panel.show();
            } else {
                this.params_panel.hide();
            }
            //~ this.params_panel.on('afterlayout',update,this,{single:true});
            //~ t.get_containing_window().doLayout();
            //~ this.params_panel.on('afterlayout',function() {
                //~ console.log("20130918 afterlayout");
                //~ t.get_containing_window().doLayout(); // doLayout(shallow, force)
            //~ },this,{single:true});
          }
        });
        tbar = tbar.concat([this.toggle_params_panel_btn]);

        if (this.auto_apply_params) {
          
          var refresh = function(newValue, oldValue, eOpts) {
            if (!t.setting_param_values && this.isValid()) {
                t._force_dirty = true;
                t.refresh();
            }
          };
          Ext.each(this.params_panel.fields,function(f) {
              f.on('change',refresh);
          //~ f.on('valid',function() {t.refresh()});
          // if (f instanceof Ext.form.Checkbox) {
          //     f.on('check',refresh);
          // } else if (f instanceof Ext.form.field.Date) {
          //     f.on('select',refresh);
          // } else if (f instanceof Ext.form.TriggerField) {
          //     f.on('select',refresh);
              //~ f.on('change',refresh);
              //~ f.on('valid',refresh);
          // } else {
          //     if (! f.on)
          //         console.log("20121010 no method 'on'",f);
          //     else
          //         f.on('change',refresh);
          //   }
          });
        }
      }
      return tbar;
  }
  ,add_param_values : function (p,force_dirty) {
    if (this.params_panel) {
      /*
      * 20120918 add param_values to the request string
      * *only if the params_form is dirty*.
      * Otherwise Actor.default_params() would never be used.
      *
      * 20121023 But IntegClients.params_default has non-empty default values.
      * Users must have the possibility to make them empty.
      *
      * 20130605 : added `force_dirty` parameter because Checkbox fields don't
      * mark their form as dirty when check is fired.
      *
      * 20130721 : `force_dirty` not as a parameter but as
      * `this._force_dirty` because
      *
      * 20130915 : both _force_dirty and force_dirty parameter are needed.
      *
      */
      if (force_dirty || this._force_dirty || this.params_panel.form.isDirty()) {
      //~ if (this._force_dirty || this.params_panel.form.isDirty()) {
        p.{{constants.URL_PARAM_PARAM_VALUES}} = this.get_param_values();
        //~ console.log("20130923 form is dirty (",force_dirty,this._force_dirty,this.params_panel.form.isDirty(),")");
        //~ console.log("20130923 form is dirty",p);
      }else{
        //~ console.log("20130923 form not dirty:",this.params_panel.form);
        if (this.status_param_values)
          p.{{constants.URL_PARAM_PARAM_VALUES}} = Lino.fields2array(
            this.params_panel.fields,this.status_param_values);
      }
      //~ if (!this.params_panel.form.isDirty()) return;
      //~ p.{{constants.URL_PARAM_PARAM_VALUES}} = this.get_param_values();
      //~ console.log("20120203 add_param_values added pv",p.pv,"to",p);
    }
  },
  get_param_values : function() { // similar to get_field_values()
      return Lino.fields2array(this.params_panel.fields);
  },
  set_param_values : function(pv) {
    if (this.params_panel) {
        if (this._force_dirty){
            pv = {};
            for (var field in this.params_panel.fields){
                var current_field = this.params_panel.fields[field];
                if (current_field instanceof Lino.ComboBox){
                    pv[current_field.hiddenName] = current_field.hiddenvalue_tosubmit;
                    if (current_field.isDirty()){
                        current_field.hiddenvalue_id = current_field.hiddenvalue_tosubmit;
                    }
                    pv[current_field.name] = current_field.rawValue;
                }
                else {
                    pv[current_field.name] = current_field.getValue();
                }
            }
        }
      //~ console.log('20120203 MainPanel.set_param_values', pv);
      this.status_param_values = pv;
      //~ this.params_panel.form.suspendEvents(false);
      this.setting_param_values = true;
      if (pv) {
          // this.params_panel.form.my_loadRecord(pv);
          this.params_panel.form.setValues(pv);
      } else {
        this.params_panel.form.reset();
      }
      this.setting_param_values = false;
      this._force_dirty = false;
      //~ this.params_panel.form.resumeEvents();
    }
  }
});



Ext.define('Lino.Viewport', {
    extend :  'Ext.container.Viewport',
     mixins: ['Lino.MainPanel'],
  layout : "fit"
  ,is_home_page : true
  ,initComponent : function(){
    // Lino.Viewport.superclass.initComponent.call(this);
    this.callSuper(arguments);
    this.on('render',function(){
      // this.loadMask = new Ext.LoadMask(this.el,{msg:"{{_('Please wait...')}}"});
      //   this.loadMask = {message:"Please wait..."};
        this.loadMask = Ext.create('Ext.LoadMask',{
                                        msg    : 'Please wait...',
                                        target : this,
                                    });
      //~ console.log("20121118 Lino.viewport.loadMask",this.loadMask);
    },this);
  }
  ,refresh : function() {
      var caller = this;
      // console.log("20140829 Lino.Viewport.refresh()");
      if (caller.loadMask) caller.loadMask.show();
      var success = function(response) {
        if (caller.loadMask) caller.loadMask.hide();
        if (response.responseText) {
          var result = Ext.decode(response.responseText);
          //~ console.log('Lino.do_action()',action.name,'result is',result);
          if (result.html) {
              var cmp = Ext.getCmp('dashboard');
              // cmp.removeAll(true);  // 20140829
              cmp.update(result.html, true);
          }
          if (result.message) {
              if (result.alert) {
                  //~ Ext.MessageBox.alert('Alert',result.alert_msg);
                  Ext.MessageBox.alert('Alert',result.message);
              } else {
                  Lino.notify(result.message);
              }
          }
          
          if (result.notify_msg) Lino.notify(result.notify_msg);
          if (result.js_code) { 
            var jsr = result.js_code(caller);
            //~ console.log('Lino.do_action()',action,'returned from js_code in',result);
          };
        }
      };
      var action = {
        url : '{{extjs.build_plain_url("api","main_html")}}',
        waitMsg: "{{_('Please wait...')}}",
        failure: Lino.ajax_error_handler(caller),
        success: success,
        method: 'GET',
        params: {}
      };
      Lino.insert_subst_user(action.params);
      Ext.Ajax.request(action);
    
  }
});




Lino.open_window = function(win, st, requesting_panel) {
  // console.log("20140831 Lino.open_window()", win, win.el.getBox());
  var cw = Lino.current_window;
  if (cw) {
    // console.log("20140829 Lino.open_window() save current status",
    //             cw.main_item.get_status());
    Lino.window_history.push({
      window:cw,
      status:cw.main_item.get_status()
    });
  }
  Lino.current_window = win;
  //~ if (st.{{constants.URL_PARAM_SUBST_USER}}) 
      //~ Lino.subst_user_field.setValue(st.{{constants.URL_PARAM_SUBST_USER}});
  win.main_item.set_status(st, requesting_panel);
  // win.toFront();
  win.show();
};

Lino.load_url = function(url) {
    //~ foo.bar.baz = 2; 
    //~ console.log("20121120 Lino.load_url()");
    //~ Lino.body_loadMask.show();
    Lino.viewport.loadMask.show();
    // if (Lino.viewport.loadMask){
    //     Ext.Msg.show(Lino.viewport.loadMask);
    // }
    //~ location.replace(url);
    document.location = url;
};

Lino.close_window = function(status_update, norestore) {
  // norestore is used when called by handle_action_result() who 
  // will call set_status itself later
  var cw = Lino.current_window;
  var ww = Lino.window_history.pop();
  var retval = cw.main_item.requesting_panel;
  // console.log(
  //     "20150514 Lino.close_window() going to close", cw.title,
  //     "previous is", ww, 
  //     "norestore is", norestore,
  //     "retval is", retval);
  if (ww) {
    //~ if (status_update) Ext.apply(ww.status,status_update);
    if(!norestore) {
        if (status_update) status_update(ww);
        ww.window.main_item.set_status(ww.status);
    }
    Lino.current_window = ww.window;
  } else {
      Lino.current_window = null;
      // new since 20140829:
      if(!norestore) { Lino.viewport.refresh(); }
  }
  if (cw) cw.hide_really();
    // Should be refreshed inside of set_status or elsewhere. 
  /*
  if (ww && (typeof ww.window.main_item.refresh == 'function')) {
        ww.window.main_item.refresh();
    }
    */
  return retval;
};

Lino.kill_current_window = function() {
  // console.log("20140418 Lino.kill_current_window()");
  var cw = Lino.current_window;
  Lino.current_window = null;
  if (cw) cw.hide_really();
};

Lino.reload = function() {
    // First close all windows to ensure all changes are saved
    Lino.close_all_windows();

    // Then reload current view
    var url =  "{{extjs.build_plain_url()}}";

    var p = {};
    Lino.insert_subst_user(p);
    if (Ext.urlEncode(p))
        url = url + "?" + Ext.urlEncode(p);

    Lino.load_url(url);
};

Lino.handle_home_button = function() {
  if (Lino.window_history.length == 0)
      Lino.reload();
  else
      Lino.close_all_windows();
};

Lino.close_all_windows = function() {
    while (Lino.window_history.length > 0) {
        Lino.close_window();
    }
};

Lino.calling_window = function() {
    if (Lino.window_history.length) 
        return Lino.window_history[Lino.window_history.length-1];
};

//~ Lino.WindowAction = function(mainItemClass,windowConfig,mainConfig,ppf) {
//Lino.WindowAction = function(windowConfig,main_item_fn) {
    //~ if(!mainConfig) mainConfig = {};
    //~ mainConfig.is_main_window = true;
    //this.windowConfig = windowConfig;
    //this.main_item_fn = main_item_fn;
    //~ if (ppf) mainConfig.params_panel.fields = ppf;
    //~ this.mainConfig = mainConfig;
    //~ this.mainItemClass = mainItemClass;
//};

//Ext.define('Lino.WindowAction', {
Ext.define('Lino.WindowAction', {
    // extend: 'Ext.Component',
//Lino.WindowAction = Ext.extend(Lino.WindowAction,{
    window : null,
    //~ mainItemClass: null,
    constructor : function(windowConfig,main_item_fn){
        this.windowConfig = windowConfig;
        this.main_item_fn = main_item_fn;
    },
    get_window : function() {
      //~ if(mainConfig) Ext.apply(this.mainConfig,mainConfig);
      // if (this.window == null || this.window.isDestroyed)  { // 20140829
      // if (this.window == null || this.window.getBox().width == 0)  { // 20140829
      if (this.window == null)  {
      // if (true)  {
          //~ this.windowConfig.main_item = new this.mainItemClass(this.mainConfig);
          this.windowConfig.main_item = this.main_item_fn();
          this.window = Ext.create('Lino.Window',this.windowConfig);
      }
      else {
        // Refresh existing grid windows,
        if (Array.isArray(this.windowConfig.items)){
                this.windowConfig.items.forEach(
                    function(i){if (i.refresh != null) {i.refresh();}}
                    );                }
        // Always have first tab open on detail windows
        if (this.windowConfig.items != null &&
            this.windowConfig.items.items != null &&
            Array.isArray(this.windowConfig.items.items.items) &&
            this.windowConfig.items.items.items[0].isXType("tabpanel")) {
                this.windowConfig.items.items.items[0].setActiveTab(this.windowConfig.items.items.items[0].items.items[0]);
                }

           }

      return this.window;
    },
    run : function(requesting_panel, status) {
      // console.log('20140829 window_action.run()', this)
      var f = Lino.open_window.bind(this ,this.get_window(), status, requesting_panel);
      var panel = Ext.getCmp(requesting_panel);
        if(panel) panel.do_when_clean(true, f); else f();
    }
  
});

// HKC
//Lino.PanelMixin = {
Ext.define('Lino.PanelMixin', {
    //extend: 'Ext.panel.Table',
  get_containing_window : function (){
      if (this.containing_window) return this.containing_window;
      return this.containing_panel.get_containing_window();
  }
  ,set_window_title : function(title) {
    //~ this.setTitle(title);
    var cw = this.get_containing_window();

    //~ if (cw) {
    //~ if (cw && cw.closable) {
    if (cw && !cw.main_item.hide_window_title) {
      //~ console.log('20111202 set_window_title(',title,') for',this.containing_window);
      //~ if (! this.containing_window.rendered) console.log("WARNING: not rendered!");
      cw.setTitle(title);
    //~ } else {
      //~ document.title = title;
    }
    //~ else console.log('20111202 not set_window_title(',title,') for',this);
  }
  
});


// Lino.status_bar = new Ext.ux.StatusBar({defaultText:'Lino version {{lino.__version__}}.'});
{% if extjs.use_statusbar %}
Lino.status_bar = Ext.create('Ext.ux.StatusBar',{
    autoClear: 10000, // 10 seconds
    defaultText:'{{settings.SITE.site_version()}}.'
    });
{% endif %}

{% if settings.SITE.use_vinylfox %}
Lino.VinylFoxPlugins = function(){
    return [
        Ext.create('Ext.ux.form.HtmlEditor.Link',{}),
        Ext.create('Ext.ux.form.HtmlEditor.Divider',{}),
        Ext.create('Ext.ux.form.HtmlEditor.Word',{}),
        //~ new Ext.ux.form.HtmlEditor.FindAndReplace(),
        //~ new Ext.ux.form.HtmlEditor.UndoRedo(),
        Ext.create('Ext.ux.form.HtmlEditor.Divider',{}),
        //~ new Ext.ux.form.HtmlEditor.Image(),
        //~ new Ext.ux.form.HtmlEditor.Table(),
        Ext.create('Ext.ux.form.HtmlEditor.HR',{}),
        Ext.create('Ext.ux.form.HtmlEditor.SpecialCharacters',{}),
        Ext.create('Ext.ux.form.HtmlEditor.HeadingMenu',{}),
        Ext.create('Ext.ux.form.HtmlEditor.IndentOutdent',{}),
        Ext.create('Ext.ux.form.HtmlEditor.SubSuperScript',{}),
        Ext.create('Ext.ux.form.HtmlEditor.RemoveFormat',{})
    ];
};
{% endif %}



/* 
  Originally copied from Ext JS Library 3.3.1
  Modifications by Luc Saffre : 
  - rendering of phantom records
  - fire afteredit event
  - react on dblclcik, not on single click

 */
Ext.define('Lino.CheckColumn',{
    override : 'Ext.grid.column.Check',

    // processEvent : function(name, e, grid, rowIndex, colIndex){
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        //~ console.log('20110713 Lino.CheckColumn.processEvent',name)
        if (type == 'click') {
        //~ if (name == 'mousedown') {
        //~ if (name == 'dblclick') {
            return this.toggleValue(view.grid, recordIndex, cellIndex,record);
        } else {
            //return Ext.grid.ActionColumn.superclass.processEvent.apply(this, arguments);
             this.callSuper(arguments);
        }
    },
    
    toggleValue : function (grid,rowIndex,colIndex,record) {
        // var record = grid.store.getAt(rowIndex);
        // var dataIndex = grid.colModel.getDataIndex(colIndex);
        var dataIndex = this.dataIndex;
        // 20120514
        //~ if(record.data.disabled_fields && record.data.disabled_fields[dataIndex]) {
          //~ Lino.notify("{{_("This field is disabled")}}");
          //~ return false;
        //~ }
      
        //~ if (dataIndex in record.data['disabled_fields']) {
            //~ Lino.notify("This field is disabled.");
            //~ return false;
        //~ }
        var startValue = record.data[dataIndex];
        var value = !startValue;
        //~ record.set(this.dataIndex, value);
        var e = {
            grid: grid,
            record: record,
            field: dataIndex,
            originalValue: startValue,
            value: value,
            row: rowIndex,
            column: colIndex,
            cancel: false
        };
        // record.set(dataIndex, value);
        // if(grid.fireEvent("beforeedit", e) !== false && !e.cancel){
        //~ if(grid.fireEvent("validateedit", e) !== false && !e.cancel){
        record.set(dataIndex, value);
        delete e.cancel;
        grid.fireEvent("edit",grid, e);
        // grid.on_afteredit(grid, e);
        // Ext.fireEvent("edit",grid, e);
        // }
        return false; // Cancel event propagation
    },

    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
        if (record.data.disabled_fields && (record.data.disabled_fields[this.dataIndex]
                                            || record.data.disable_editing)) {
            metaData.tdCls += ' ' + this.disabledCls;
        }
        return r = this.defaultRenderer(value, metaData);

        // // This is how you can edit the default render of a checkbox. Commented out since not needed.
        // var p = new DOMParser();
        // var d = p.parseFromString(r,"text/html");
        // d.body.firstChild.classList.add(this.disabledCls);
        // return d.body.innerHTML

    },
    renderer_unused : function(v, p, record){
        if (record.phantom) return '';
        p.css += ' x-grid3-check-col-td'; 
        return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', v ? '-on' : '');
    },
    checkchange : function(rowIndex, checked, record, e, eOpts ) {
        console.log('Ext.field.Checkbox get changes');
},

    // Deprecate use as a plugin. Remove in 4.0
    // init: Ext.emptyFn
});

// register ptype. Deprecate. Remove in 4.0
// Ext.preg('checkcolumn', Lino.CheckColumn);

// backwards compat. Remove in 4.0
// Ext.grid.CheckColumn = Lino.CheckColumn;

// Disable by HKC (Migratio to Exjts6)
// register Column xtype
Ext.grid.column.Check = Lino.CheckColumn;


/* 20110725 : 
Lino.on_tab_activate is necessary 
in contacts.Person.2.dtl 
(but don't ask me why...)
*/
Lino.on_tab_activate = function(item) {
  //~ console.log('activate',item); 
  if (item.rendered && item.doLayout) item.doLayout();
  //~ if (item.rendered) item.doLayout();
};

Ext.define('Lino.TimeField', {
    extend: 'Ext.form.field.Time',
    format: '{{settings.SITE.time_format_extjs}}',
    altFormats: '{{settings.SITE.alt_time_formats_extjs}}',
    completeEdit: function() {
        var me = this,
            // val = me.getValue();   original code
            val = me.getRawValue();
        me.callParent(arguments);
        // Only set the raw value if the current value is valid and is not falsy
        if (me.validateValue(val)) {
            me.setValue(val);
        }
    }
  });

Ext.define('Lino.DateField', {
    extend: 'Ext.form.field.Date',
  //~ boxMinWidth: Lino.chars2width(15), // 20131005 changed from 11 to 15
    format: '{{settings.SITE.date_format_extjs}}',
    altFormats: '{{settings.SITE.alt_date_formats_extjs}}'
  });

Ext.define('Lino.DatePickerField', {
    extend: 'Ext.picker.Date',
  //~ boxMinWidth: Lino.chars2width(11),
    format: '{{settings.SITE.date_format_extjs}}',
  //~ altFormats: '{{settings.SITE.alt_date_formats_extjs}}'
    formatDate : function(date){
      //~ console.log("20121203 formatDate",this.name,date);
      return Ext.isDate(date) ? date.dateFormat(this.format) : date;
  }
});

Ext.define('Lino.DateTimeField', {
    extend: 'Ext.ux.DateTimeField',
    dateFormat: '{{settings.SITE.date_format_extjs}}',
    timeFormat: '{{settings.SITE.time_format_extjs}}'
  //~ ,hiddenFormat: '{{settings.SITE.date_format_extjs}} {{settings.SITE.time_format_extjs}}'
});

Ext.define('Lino.URLField', {
    extend: 'Ext.form.field.Text',
    triggerClass : 'x-form-search-trigger',
    //~ triggerClass : 'x-form-world-trigger',
    vtype: 'url',
    onTriggerClick : function() {
    //~ console.log('Lino.URLField.onTriggerClick',this.value)
    //~ document.location = this.value;
        window.open(this.getValue(),'_blank');
    }
});

Ext.define('Lino.IncompleteDateField', {
    extend: 'Ext.form.TextField',
    //~ regex: /^-?\d+-[01]\d-[0123]\d$/,
    //~ regex: /^[0123]\d\.[01]\d\.-?\d+$/,
    maxLength: 10,
    boxMinWidth: Lino.chars2width(10),
    regex: {{settings.SITE.date_format_regex}},
    regexText: '{{_("Enter a date in format YYYY-MM-DD (use zeroes for unknown parts).")}}'
});


//~ Lino.make_dropzone = function(cmp) {
    //~ cmp.on('render', function(ct, position){
      //~ ct.el.on({
        //~ dragenter:function(event){
          //~ event.browserEvent.dataTransfer.dropEffect = 'move';
          //~ return true;
        //~ }
        //~ ,dragover:function(event){
          //~ event.browserEvent.dataTransfer.dropEffect = 'move';
          //~ event.stopEvent();
          //~ return true;
        //~ }
        //~ ,drop:{
          //~ scope:this
          //~ ,fn:function(event){
            //~ event.stopEvent();
            //~ console.log(20110516);
            //~ var files = event.browserEvent.dataTransfer.files;
            //~ if(files === undefined){
              //~ return true;
            //~ }
            //~ var len = files.length;
            //~ while(--len >= 0){
              //~ console.log(files[len]);
              //~ // this.processDragAndDropFileUpload(files[len]);
            //~ }
          //~ }
        //~ }
      //~ });
    //~ });
//~ };

//~ Lino.FileUploadField = Ext.ux.form.FileUploadField;

Ext.define('Lino.FileUploadField', {
    extend: 'Ext.ux.form.FileUploadField',
    unused_onRender : function(ct, position){
      //Lino.FileUploadField.superclass.onRender.call(this, ct, position);
         this.callSuper(ct, position);
      this.el.on({
        dragenter:function(event){
          event.browserEvent.dataTransfer.dropEffect = 'move';
          return true;
        }
        ,dragover:function(event){
          event.browserEvent.dataTransfer.dropEffect = 'move';
          event.stopEvent();
          return true;
        }
        ,drop:{
          scope:this
          ,fn:function(event){
            event.stopEvent();
            //~ console.log(20110516);
            var files = event.browserEvent.dataTransfer.files;
            if(files === undefined){
              return true;
            }
            var len = files.length;
            while(--len >= 0){
              console.log(files[len]);
              //~ this.processDragAndDropFileUpload(files[len]);
            }
          }
        }
      });
    }
});

Ext.define('Lino.FileField', {
    extend: 'Ext.form.field.Text',
    triggerClass : 'x-form-search-trigger',
    editable: false,
    onTriggerClick : function() {
        //~ console.log('Lino.URLField.onTriggerClick',this.value)
        //~ document.location = this.value;
        if (this.getValue()) window.open(MEDIA_URL + '/'+this.getValue(),'_blank');
    }
});

Lino.file_field_handler = function(panel,config) {
  if (panel.action_name == 'insert') {
      panel.has_file_upload = true;
{%if settings.SITE.use_awesome_uploader %}
      return { xtype:'button', text: 'Upload', handler: Lino.show_uploader }
{% else %}

      // config.value = '<br/><br/>';

      var f = new Lino.FileUploadField(config);
      //~ Lino.make_dropzone(f);
      return f;
      //~ return new Ext.ux.form.FileUploadField(config);
      //~ return new Lino.FileField(config);
{% endif %}      
  } else {
      //~ return new Lino.URLField(config);
      return new Lino.FileField(config);
  }
};

Ext.define('Lino_Panel', {
    override : 'Ext.panel.Panel',
    // bodyStyle: 'padding:0px;width:0px;',
    bodyStyle : 'background: #d3e1f1;',
});


Ext.define('Lino.VBorderPanel', {
    extend: 'Ext.Panel',
    constructor : function(config) {
      config.layout = 'border';
      delete config.layoutConfig;
      //Lino.VBorderPanel.superclass.constructor.call(this,config);
         this.callSuper(config);
      for(var i=0; i < this.items.length;i++) {
        var item = this.items.get(i);
        if (this.isVertical(item) && item.collapsible) {
          item.on('collapse',this.onBodyResize,this);
          item.on('expand',this.onBodyResize,this);
        }
      }
    },
    isVertical : function(item) {
       return (item.region == 'north' || item.region == 'south' || item.region == 'center');
    },
    onBodyResize: function(w, h){
        //~ console.log('VBorderPanel.onBodyResize',this.title)
      if (this.isVisible()) { // to avoid "Uncaught TypeError: Cannot call method 'getHeight' of undefined."
        var sumflex = 0;
        var availableHeight = this.getInnerHeight();
        var me = this;
        this.items.each(function(item){
          if (me.isVertical(item)) {
              if (item.collapsed || item.flex == 0 || item.flex === undefined) {
                  if (item.rendered) availableHeight -= item.getHeight();
              } else {
                  sumflex += item.flex;
              }
          } 
          
        });
        //~ for(var i=0; i < this.items.length;i++) {
          //~ var item = this.items.get(i);
          //~ // if (this.isVertical(item) && item.getResizeEl()) {
          //~ if (this.isVertical(item)) {
              //~ if (item.collapsed || item.flex == 0 || item.flex === undefined) {
                  //~ // item.syncSize()
                  //~ // item.doLayout()
                  //~ // if (item.region == "north") console.log('region north',item.getHeight(),item.id, item);
                  //~ // if (item.getHeight() == 0) console.log(20100921,'both flex and getHeight() are 0!');
                  //~ availableHeight -= item.getHeight();
              //~ } else {
                  //~ sumflex += item.flex;
                  //~ // console.log(item.flex);
              //~ }
          //~ } 
          //~ // else console.log('non-vertical item in VBoderPanel:',item)
        //~ }
        var hunit = availableHeight / sumflex;
        //~ console.log('sumflex=',sumflex,'hunit=',hunit, 'availableHeight=',availableHeight);
        for(var i=0; i < this.items.length;i++) {
          var item = this.items.get(i);
          if (this.isVertical(item)) {
              if (item.flex != 0 && ! item.collapsed) {
                  item.setHeight(hunit * item.flex);
                  //~ console.log(item.region,' : height set to',item.getHeight());
              }
          }
          //~ else console.log('non-vertical item in VBoderPanel:',item)
        }
      }
      //Lino.VBorderPanel.superclass.onBodyResize.call(this, w, h);
         this.callSuper(w, h);
    }
});

function PseudoConsole() {
    this.log = function() {};
};
if (typeof(console) == 'undefined') console = Ext.create('PseudoConsole',{});

Lino.notify = function(msg) {
  if (msg == undefined) msg = ''; else console.log(msg);
  {% if extjs.use_statusbar %}
  Lino.status_bar.setStatus({
    text: msg,
    iconCls: 'ok-icon',
    clear: true // auto-clear after a set interval
  });
  {% else %}
    if (msg == undefined) return;
    // Lino.alert(msg);
  {% endif %}
};

Lino.alert = function(msg) {
  Ext.MessageBox.alert('Notify',msg);
};


//~ Lino.show_about = function() {
  //~ new Ext.Window({
    //~ width: 400, height: 400,
    //~ title: "About",
    //~ html: '<a href="http://www.extjs.com" target="_blank">ExtJS</a> version ' + Ext.version
  //~ }).show();
//~ };

function obj2str(o) {
  if (typeof o != 'object') return String(o);
  var s = '';
  for (var p in o) {
    s += p + ': ' + obj2str(o[p]) + '\n';
  }
  return s;
}

Lino.on_store_exception = function (store,type,action,options,response,arg) {
  //~ throw response;
  console.log("on_store_exception: store=",store,
    "type=",type,
    "action=",action,
    "options=",options,
    "response=",response,
    "arg=",arg);
  if (arg != undefined && arg) { console.log(arg.stack)};
  Ext.Msg.alert("{{_('Database problem')}}",
                "{{_('There was a problem with the database connection. If the error persists, try reloading your browser.')}}");
};

//~ Lino.on_submit_success = function(form, action) {
   //~ Lino.notify(action.result.message);
   //~ this.close();
//~ };

Lino.on_submit_failure = function(form, action) {
    //~ Lino.notify();
  // action may be undefined
    switch (action.failureType) {
        case Ext.form.Action.CLIENT_INVALID:
            Ext.Msg.alert('Client-side failure', 'Form fields may not be submitted with invalid values');
            break;
        case Ext.form.Action.CONNECT_FAILURE:
            Ext.Msg.alert('Connection failure', 'Ajax communication failed');
            break;
        case Ext.form.Action.SERVER_INVALID:
            Ext.Msg.alert('Server-side failure', action.result.message);
   }
};



/*
Lino.save_wc_handler = function(ww) {
  return function(event,toolEl,panel,tc) {
    var pos = panel.getPosition();
    var size = panel.getSize();
    wc = ww.get_window_config();
    Ext.applyIf(wc,{ 
      x:pos[0],y:pos[1],height:size.height,width:size.width,
      maximized:panel.maximized});
    Lino.do_action(ww,{url:'/window_configs/'+ww.config.permalink_name,params:wc,method:'POST'});
  }
};

*/

Lino.show_in_own_window_button = function(handler) {
  return {
    qtip: "{{_("Show this panel in own window")}}", 
    //id: "up",
    type: "up",
      callback : function(panel, tool, event) {
          handler.run(null,{base_params:panel.containing_panel.get_master_params()});
    }
  }
}

Lino.action_handler = function (panel, on_success, on_confirm) {
  return function (response) {
      if (!panel) { 
          if (Lino.current_window) 
              panel = Lino.current_window.main_item;
          else panel = Lino.viewport;
      }
    if (panel.loadMask) {
        panel.loadMask.hide();
    }
    if (!response.responseText) return ;
    var result = Ext.decode(response.responseText);
    Lino.handle_action_result(panel, result, on_success, on_confirm);
  }
};

Lino.handle_action_result = function (panel, result, on_success, on_confirm) {

    // console.log('20150514 Lino.handle_action_result()', result);
    
    // if (panel instanceof Lino.GridPanel) {
    //     gridmode = true;
    // } else {
    //     gridmode = false;
    // }

    //~ if (result.goto_record) {
        //~ var js = "Lino." + result.goto_record[0] + '.detail.run';
        //~ var h = eval(js);
        //~ h(panel,{record_id:result.goto_record[1]});
    //~ }
    
    if (result.goto_url) {
        document.location = result.goto_url;
        if (result.close_window) Lino.close_window();
        return;
    }
    
    if (result.xcallback) {
        //~ var config = {title:"{{_('Confirmation')}}"};
        var config = {title:result.xcallback.title};
        config.buttons = Ext.Msg.YESNO;
        config.icon = Ext.Msg.QUESTION;
        var p = {};
        Lino.insert_subst_user(p);
        //config.buttons = result.xcallback.buttons;
        config.message = result.message;
        config.fn = function(buttonId) {
            panel.loadMask.show();
          //~ Lino.insert_subst_user(p);
          Ext.Ajax.request({
            method: 'GET',
            url: '{{extjs.build_plain_url("callbacks")}}/'
                  + result.xcallback.id + '/' + buttonId,
            params: p,
            failure: Lino.ajax_error_handler(panel),
            success: Lino.action_handler(panel, on_success, on_confirm)
          });
        };
        Ext.MessageBox.show(config);
        return;
    }

    // `record_id` and/or `data_record` both mean "display the detail
    // of this record". 
    
    if(result.detail_handler_name) {
        // TODO: make sure that result.detail_handler_name is secure
        var detail_handler = eval("Lino." + result.detail_handler_name);
    }
    var ns = {};  // new status
    if (result.close_window) {
        
        // Subsequent processing expects that `panel` is "the current
        // panel". But if we close the window, `panel` must point
        // to the previous window. Note the case of an insert window
        // that has been invoked by double-clicking on the phantom row
        // of a slave table in a detail window. In that case we want
        // `panel` to become the grid panel of the slave table who
        // called the insert window, not the master's detail form
        // panel.  When the insert window has been called by an action
        // link (e.g. generated using ar.insert_button), then
        // Lino.close_window can return `undefined`.

        if(result.record_id || result.data_record) {
            var ww = Lino.calling_window();
            if (ww && ww.window.main_item instanceof Lino.FormPanel) {
                if (ww.window.main_item.ls_detail_handler == detail_handler) {
                    ns.record_id = result.record_id;
                    ns.data_record = result.data_record;
                    // console.log("20150514 use new status.");
                }
            }
        }

        panel = Lino.close_window(
            function(ww) { Ext.apply(ww.status, ns) }); 
        if (!panel) 
            // console.log("20150514 close_window returned no panel.");
            if (Lino.current_window)
                panel = Lino.current_window.main_item;

    }

    if(result.record_id || result.data_record) {
        if (! (ns.record_id || ns.data_record)) {
          // no close_window, so we must update record data in current
          // panel (if it is the detail_handler for this record) or
          // open the detail handler.
          var st = {
              record_id: result.record_id,
              data_record: result.data_record
          };
          if (result.active_tab) st.active_tab = result.active_tab;
          if (panel instanceof Lino.FormPanel 
              && panel.ls_detail_handler == detail_handler) 
            {
              // console.log("20150514 use panel.set_status().");
              panel.set_status(st);
          } else if (panel !== undefined) {
              // console.log("20150514 run detail_handler.");
              st.base_params = panel.get_base_params();
              detail_handler.run(null, st);
          }

          // if (panel instanceof Lino.FormPanel 
          //     && panel.ls_url == result.actor_url) {
          //     // console.log("20140506 case 2 it's a FormPanel:", panel);
          //     panel.set_status({
          //         record_id: result.record_id,
          //         data_record: result.data_record});
          // } else if (panel.ls_detail_handler 
          //            && panel.ls_url == result.actor_url) {
          //     // console.log("20140506 case 4");
          //     panel.ls_detail_handler.run(null, {
          //         record_id: result.record_id,
          //         data_record: result.data_record,
          //         base_params: panel.get_base_params()});
          // } else {
          //     result.refresh_all = true;
          //     console.log("20140604 case 6", result.actor_url);
          // }
        }
    }

    // `eval_js` must get handled after `close_window` because it
    // might ask to open a new window (and we don't want to close that
    // new window).  It must execute *before* any MessageBox,
    // otherwise the box would get hidden by a window that opens
    // afterwards.

    if (result.eval_js) {
        //~ console.log(20120618,result.eval_js);
        eval(result.eval_js);
    }
    
    if (on_success && result.success) {
        // console.log("20140430 handle_action_result calls on_success", 
        //             on_success);
        on_success(result);
    }
    
    if (result.info_message) {
        console.log(result.info_message);
    }
    
    if (result.warning_message) {
        if (!result.alert) result.alert = "{{_('Warning')}}";
        Ext.MessageBox.alert(result.alert, result.warning_message);
    }
    
    if (result.message) {
        //~ if (result.alert && ! gridmode) {
        if (result.alert) { // 20120628b 
            //~ Ext.MessageBox.alert('Alert',result.alert_msg);
            if (result.alert === true) result.alert = "{{_('Alert')}}";
            Ext.MessageBox.alert(result.alert, result.message);
        } else {
            Lino.notify(result.message);
        }
    }

    if(result.record_deleted && panel.ls_detail_handler == detail_handler) {
        panel.after_delete();
    }
    
    if (result.refresh_all) {
        var cw = Lino.current_window;
        // var cw = panel.get_containing_window();
        if (cw) {
            // console.log("20140917 refresh_all calls refresh on", cw.main_item);
            cw.main_item.refresh();
        } else { Lino.viewport.refresh(); }
        // else console.log("20140917 cannot refresh_all because ",
        //                  "there is no current_window");
    } else {
        if (result.refresh) {
            // console.log("20140917 Gonna call panel.refresh()", panel);
            panel.refresh();
        }
    }
    {%- if settings.SITE.is_installed('davlink') -%}
    if (result.open_davlink_url) {
       Lino.davlink_open(result.open_davlink_url);
    }
    {%- endif -%}
    if (result.goto_url) document.location = result.goto_url;
    if (result.open_url) {
        //~ console.log(20111126,result.open_url);
        //~ if (!result.message)
            //~ Lino.notify('Open new window <a href="'+result.open_url+'" target="_blank">'+result.open_url+'</a>');
        window.open(result.open_url,'foo',"");
        //~ document.location = result.open_url;
    }
};

// obsolete but still used for deleting records.
Lino.do_action = function(caller,action) { 
  action.success = function(response) {
    if (caller.loadMask) caller.loadMask.hide();
    //~ console.log('Lino.do_action()',action,'action success',response);
    if (action.after_success) {
        //~ console.log('Lino.do_action() calling after_success');
        action.after_success();
    }
    if (response.responseText) {
      var result = Ext.decode(response.responseText);
      //~ console.log('Lino.do_action()',action.name,'result is',result);
      if (result.message) {
          if (result.alert) {
              //~ Ext.MessageBox.alert('Alert',result.alert_msg);
              Ext.MessageBox.alert('Alert',result.message);
          } else {
              Lino.notify(result.message);
          }
      }
      
      //~ if (result.alert_msg) Ext.MessageBox.alert('Alert',result.alert_msg);
      //~ if (result.message) Lino.notify(result.message);
      if (result.notify_msg) Lino.notify(result.notify_msg);
      if (result.js_code) { 
        //~ console.log('Lino.do_action()',action,'gonna call js_code in',result);
        var jsr = result.js_code(caller);
        //~ console.log('Lino.do_action()',action,'returned from js_code in',result);
        if (action.after_js_code) {
          //~ console.log('Lino.do_action()',action,'gonna call after_js_code');
          action.after_js_code(jsr);
          //~ console.log('Lino.do_action()',action,'returned from after_js_code');
        //~ } else {
          //~ console.log('Lino.do_action()',action,' : after_js_code is false');
        }
      };
    }
  };
  Ext.applyIf(action,{
    waitMsg: "{{_('Please wait...')}}",
    failure: Lino.ajax_error_handler(caller),
    params: {}
  });
  //~ action.params.{{constants.URL_PARAM_SUBST_USER}} = Lino.subst_user;
  Lino.insert_subst_user(action.params);
  
  Ext.Ajax.request(action);
};

//~ Lino.gup = function( name )
//~ {
  //~ // Thanks to http://www.netlobo.com/url_query_string_javascript.html
  //~ name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  //~ var regexS = "[\\?&]"+name+"=([^&#]*)";
  //~ var regex = new RegExp( regexS );
  //~ var results = regex.exec( window.location.href );
  //~ if( results == null )
    //~ return "";
  //~ else
    //~ return results[1];
//~ };

//~ Lino.refresh_handler = function (ww) {
  //~ return function() { 
      //~ console.log('refresh',ww);
      //~ ww.main_item.doLayout(false,true);
      //~ ww.main_item.syncSize();
  //~ }
//~ };

//~ Lino.tools_close_handler = function (ww) {
  //~ return function() { 
      //~ ww.close();
  //~ }
//~ };
Lino.permalink_handler = function (ww) {
  return function() { 
    //~ document.location = ww.main_item.get_permalink();
    //~ console.log('20130723 Lino.permalink_handler',ww);
    
    /* Uncaught TypeError: Cannot read property 'main_item' of null  */
    if (ww) {
        var url = ww.main_item.get_permalink();
    } else {
        var url = Lino.viewport.get_permalink();
    }
    Lino.load_url(url);
  }
};
//~ Lino.run_permalink = function() {
  //~ var plink = Lino.gup('permalink');
  //~ if(plink) { eval('Lino.'+plink); }
//~ }


Lino.ajax_error_handler = function(panel) {
  return function(response,options) {
    console.log('Ajax failure:', response, options);
    //  Disable by HKC
    if (panel.loadMask) panel.loadMask.hide();
    if (response.responseText) {
      var lines = response.responseText.split('\n');
      if (lines.length > 10) {
          line = lines.splice(5, lines.length-10, "(...)");
      }
      //~ console.log(20131005, response.statusText.toCamel());
      Ext.MessageBox.alert(
        response.statusText.toCamel(),
        lines.join('<br/>')
        //~ response.responseText.replace(/\n/g,'<br/>'))
      )
    } else {
      Ext.MessageBox.alert('Action failed',
        'Lino server did not respond to Ajax request');
    }
  }
}
// Ext.Ajax.on('requestexception',Lino.ajax_error_handler)
 
{% if settings.SITE.use_quicktips %}

Ext.QuickTips.init();

/* setting QuickTips dismissDelay to 0 */
// Apply a set of config properties to the singleton
//~ Ext.apply(Ext.QuickTips.getQuickTip(), {
//~ Ext.apply(Ext.ToolTip, {
    //~ dismissDelay: 0
    //~ autoHide: false,
    //~ closable: true,
    //~ maxWidth: 200,
    //~ minWidth: 100,
    //~ showDelay: 50      // Show 50ms after entering target
    //~ ,trackMouse: true
//~ });


//~ Ext.apply(Ext.QuickTip, {
    //~ dismissDelay: 0,
//~ });
  
Lino.quicktip_renderer = function(title,body) {
  return function(c) {
    //~ if (c instanceof Ext.Panel) var t = c.bwrap; else // 20130129
    // if (c instanceof Ext.Panel) var t = c.header; else // 20130129
    var t = c.getId();
    //~ console.log(20130129,t,title,body);
    //~ t.dismissDelay = 0;
    Ext.tip.QuickTipManager.register({
      target: t,
      //~ cls: 'lino-quicktip-classical',
      dismissDelay: 0,
      //~ autoHide: false,
      showDelay: 50,      // Show 50ms after entering target
      //~ title: title,
      text: body
    });
  }
};

{% endif %}
  
Lino.help_text_editor = function() {
  //~ var bp = {
      //~ mk:this.content_type,
      //~ mt:1
    //~ };
    //~ console.log(20120202,bp);
  //~ Lino.lino.ContentTypes.detail({},{base_params:bp});
  //~ Lino.lino.ContentTypes.detail.run(null,{record_id:this.content_type});
  //  Edited by HKC
  Lino.gfks.ContentTypes.detail.run(null,{record_id:this.content_type});
};

// Path to the blank image should point to a valid location on your server
//~ Ext.BLANK_IMAGE_URL = MEDIA_URL + '/extjs/resources/images/default/s.gif'; 


// used as Ext.grid.Column.renderer for id columns in order to hide the special id value -99999
Lino.id_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  //~ if (record.phantom) return '';
  return value;
;}

Lino.raw_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  return value;
};

Lino.text_renderer = function(value, metaData, record, rowIndex, colIndex, store) {
  //~ return "not implemented"; 
  return value;
};

Ext.define('Lino.NullNumberColumn', {
    extend: 'Ext.grid.Column',
    align : 'right',
    format : '{{settings.SITE.default_number_format_extjs}}', 
    renderer : function(value, metaData, record, rowIndex, colIndex, store) {
        //~ console.log(20130128,"NullNumberColumn.renderer",value);
        if (value === null || (Ext.isString(value) && value.startsWith("extModel"))) return '';
        return Ext.util.Format.number(value, this.format);
    }
});

Ext.define('Lino.NavigationModel', {
    override : 'Ext.grid.NavigationModel',
    onCellMouseDown: function(view, cell, cellIndex, record, row, recordIndex, mousedownEvent) {
        /*// Old Hamza code, the JS is correct inside of href, no need to do any evaluations.
        if (mousedownEvent.target.text == '➚'){
            mousedownEvent.preventDefault(true);
            var href = mousedownEvent.target.href;
            var detail_panel = href.split('-')[0];
            var params = href.split('-')[1];
            var record_id = parseInt(params);
            // Lino.run_detail_handler(eval(detail_panel),params);
            var detail_panel_object = eval(detail_panel);
            detail_panel_object.run(null,{record_id:record_id});
        }
        */
        if  (mousedownEvent.target.text != undefined){
            // Clicked on a link, we want to interrupt the event, so that it doesn't active the cell and start editing
            // Ticket: #2127 (31102017)
            return
            /*
            var targetEl = mousedownEvent.getTarget(null, null, true);
            targetEl.focus();
            this.callParent(arguments);
            */
        }
        else {
            // var targetEl = mousedownEvent.getTarget(null, null, true);
            // targetEl.focus();
            this.callParent(arguments);
        }
    },
    });

Lino.link_button = function(url) {
    // return '<a href="' + url + '"><img src="{{settings.SITE.build_media_url('lino', 'extjs', 'images', 'xsite', 'link.png')}}" alt="link_button"></a>'
    return Ext.String.format('<a href="' + url + '" style="z-index: 1000">&#10138;</a>');
};

Lino.link_button_with_value = function(url,value) {
    // return '<a href="' + url + '"><img src="{{settings.SITE.build_media_url('lino', 'extjs', 'images', 'xsite', 'link.png')}}" alt="link_button"></a>'
    return Ext.String.format('   <a href="' + url + '" style="z-index: 1000">' + value + '</a>');
};

Lino.fk_renderer = function(fkname,handlername) {
  //~ console.log('Lino.fk_renderer handler=',handler);
  return function(value, metaData, record, rowIndex, colIndex, store,view) {
    //~ console.log('Lino.fk_renderer',fkname,rowIndex,colIndex,record,metaData,store);
    //~ if (record.phantom) return '';
    if (value) {
        var url = 'javascript:'+handlername + '.run(null,{\'record_id\':' + String(record.data[fkname]) + '})'
        return Lino.link_button(url) + Lino.link_button_with_value(url,value);
        // until 20140822 (clickable foreign keys):
        // var s = '<a href="javascript:' ;
        // s += handlername + '.run(null,{record_id:\'' + String(record.data[fkname]) + '\'})">';
        // s += value + '</a>';
        // return s
    }
    return '';
  }
};

Lino.lfk_renderer = function(panel,fkname) {
  //~ console.log('Lino.fk_renderer handler=',handler);
  var handlername = 'console.log';
  return function(value, metaData, record, rowIndex, colIndex, store) {
    //~ console.log('Lino.fk_renderer',fkname,rowIndex,colIndex,record,metaData,store);
    if (record.phantom) return '';
    if (value) {
        var s = '<a href="javascript:' ;
        s += handlername + '({},{record_id:\'' + String(record.data[fkname]) + '\'})">';
        s += value + '</a>';
        //~ console.log('Lino.fk_renderer',value,'-->',s);
        return s
    }
    return '';
  }
};

//~ Lino.gfk_renderer = function() {
  //~ return function(value, metaData, record, rowIndex, colIndex, store) {
    //~ if (record.phantom) return '';
    //~ console.log('Lino.gfk_renderer',value,colIndex,record,metaData,store);
    //~ return value;
  //~ }
//~ };


Lino.build_buttons = function(panel,actions) {
  //~ console.log("20121006 Lino.build_buttons",actions);
  if (actions) {
    var buttons = Array(actions.length);
    var cmenu = Array(actions.length);
    var keyhandlers = {};
    for (var i=0; i < actions.length; i++) {
      var a = actions[i];
      if (a.menu) a.menu = Lino.build_buttons(panel,a.menu).bbar;
      buttons[i] = a;
      cmenu[i] = {
            text : a.menu_item_text,
            iconCls : a.iconCls,
            menu : a.menu,
            itemId : a.itemId
          };
      if (a.panel_btn_handler) {
          //Edited by HKC
          //var h = a.panel_btn_handler.createCallback(panel);
          //var h = Ext.callback(a.panel_btn_handler,a, [panel]);
          var h = Ext.Function.pass(a.panel_btn_handler, [panel]);
          //callback = Ext.Function.pass(originalFunction, ['Hello', 'World']);
          if (a.auto_save == true) {
              //Edited by HKC
              //h = panel.do_when_clean.createDelegate(panel,[true,h]);
              h = panel.do_when_clean.bind(panel,true,h);
          } else if (a.auto_save == null) {
              //Edited by HKC
              //h = panel.do_when_clean.createDelegate(panel,[false,h]);
              h = panel.do_when_clean.bind(panel,false,h);
          } else if (a.auto_save == false) {
              // h = h;
          } else {
              console.log("20120703 unhandled auto_save value",a)
          }
          buttons[i].handler = h;
          cmenu[i].handler = h;
          if (a.keycode) {
              keyhandlers[a.keycode] = h;
          }
          //~ if (buttons[i].xtype == 'splitbutton') {
              //~ cmenu[i].menu = a.menu;
          //~ } else {
              //~ cmenu[i].handler = h;
          //~ }
      } else {
          console.log("action without panel_btn_handler",a)
          // cmenu[i].handler = a.handler;
      }
    }
    return {
        bbar:buttons, 
        // cmenu:new Ext.menu.Menu(cmenu),
        cmenu:Ext.create('Ext.menu.Menu', {renderTo: Ext.getBody(),items:cmenu}),
        keyhandlers: keyhandlers
    };
  }
}

Lino.do_when_visible = function(cmp,todo) {
  //~ if (cmp.el && cmp.el.dom) 
  if (cmp.isVisible()) { 
    // 'visible' means 'rendered and not hidden'
    //~ console.log(cmp.title,'-> cmp is visible now');
    todo(); 
  //~ } else {
      //~ cmp.on('resize',todo,cmp,{single:true});
  //~ }
  //~ if (false) { // 20120213
  } else { 
    //~ console.log('Lino.do_when_visible() must defer because not isVisible()',todo,cmp);
    if (cmp.rendered) {
      //~ console.log(cmp,'-> cmp is rendered but not visible: and now?');
      //~ console.log(cmp.title,'-> cmp is rendered but not visible: try again in a moment...');
      //~ var fn = function() {Lino.do_when_visible(cmp,todo)};
      //~ fn.defer(100);
      
      //Lino.do_when_visible.defer(50,this,[cmp,todo]);
        Ext.defer(function() {
           Lino.do_when_visible(cmp,todo);
        },  50) ;
      //~ Lino.do_when_visible.defer(100,this,[cmp,todo]);
      
    } else {
      //~ console.log(cmp.title,'-> after render');
      cmp.on('afterrender',todo,cmp,{single:true});
    }
  }
  
};    

/*
*/
Lino.do_on_current_record = function(panel, fn, phantom_fn) {
  // console.log('20140930 do_on_current_record', arguments);
  var rec = panel.get_current_record();
  if (rec == undefined) {
    Lino.notify("There's no selected record.");
    return;
  }
  // 20120307 A VirtualTable with a Detail (lino.Models) has only "phantom" records.
  if (rec.phantom) {
    //~ if (!panel.editable) { console.log("20120312 not editable:",panel)}
    if (phantom_fn) {
      phantom_fn(panel);
    } else {
      Lino.notify("{{_('Action not available on phantom record.')}}");
    }
    return;
  }
  return fn(rec);
};


Lino.call_ajax_action = function(
    panel, method, url, p, actionName, step, on_confirm, on_success) {
  p.{{constants.URL_PARAM_ACTION_NAME}} = actionName;
  if (!panel || !panel.isVisible()) {
  //~ if (true) { // 20131026 : workflow_actions of a newly created record detail executed but did't refresh the screen because their requesting panel was the insert (not the detail) formpanel.
      if (Lino.current_window) 
          panel = Lino.current_window.main_item;
      else panel = Lino.viewport;
  }
  // console.log("20150130 a", p.{{constants.URL_PARAM_PARAM_VALUES}});
  // Ext.apply(p, panel.get_base_params());
  // console.log("20150130 b", p.{{constants.URL_PARAM_PARAM_VALUES}});
  // if some other method has defined selected
  if (panel.get_selected && p.{{constants.URL_PARAM_SELECTED}} === undefined)
  {
      var selected_recs = panel.get_selected();
      console.log("20130831",selected_recs);
      var rs = Array(selected_recs.length);
      for(var i=0; i < selected_recs.length;i++) {
          rs[i] = selected_recs[i].data.id;
      };
      p.{{constants.URL_PARAM_SELECTED}} = rs;
  }
  
  // console.log("20140516 Lino.call_ajax_action", p, actionName, step);
  if (panel.loadMask) panel.loadMask.show();
    
  Ext.Ajax.request({
    method: method
    ,url: url
    ,params: p
    ,success: Lino.action_handler(panel, on_success, on_confirm)
    ,failure: Lino.ajax_error_handler(panel)
  });
};




Lino.row_action_handler = function(actionName, hm, pp) {
  var p = {};
  var fn = function(panel, btn, step) {
      // console.log('20150514 row_action_handler');
      if (pp) { p = pp(panel); if (! p) return; }
      
      if (!panel || panel.get_current_record == undefined) { // AFTER_20130725
        // console.log('20140930 row_action_handler 2', panel);
        panel = Ext.getCmp(panel);
        if (panel == undefined) {
          Lino.notify("Invalid panel spec.");
          return;
        }
      }
      
      Lino.do_on_current_record(panel, function(rec) {
          //~ console.log(panel);
          panel.add_param_values(p, true);
          Ext.apply(p, panel.get_base_params());
          Lino.call_ajax_action(
              panel, hm, panel.get_record_url(rec.id), 
              p, actionName, step, fn);
      });
  };
  return fn;
};

Lino.list_action_handler = function(ls_url,actionName,hm,pp) {
  var p = {};
  var url = '{{extjs.build_plain_url("api")}}' + ls_url
  var fn = function(panel,btn,step) {
      //~ console.log("20121210 Lino.list_action_handler",arguments);
      if (pp) { p = pp(panel);  if (! p) return; }
      if (panel) { // may be undefined when called e.g. from quicklink
          panel.add_param_values(p, true);
          Ext.apply(p, panel.get_base_params());
      }
      Lino.call_ajax_action(panel, hm,url, p, actionName, step, fn);
  };
  return fn;
};

Lino.param_action_handler = function(window_action) { // 20121012
  var fn = function(panel,btn,step) {
    Lino.do_on_current_record(panel,function(rec) {
      window_action.run(panel.getId(),{}); 
    });
  };
  return fn;
};


Lino.run_row_action = function(
    requesting_panel, is_on_main_actor, url, meth, pk,
    actionName, params, preprocessor) {
  //~ var panel = action.get_window().main_item;
  // console.log("20140930 Lino.run_row_action", params);
  url = '{{extjs.build_plain_url("api")}}' + url  + '/' + pk;
  var panel = Ext.getCmp(requesting_panel);
  // var params = {}
  // if (init_params) Ext.apply(params, init_params);
  if (!params) params = {};
  if (preprocessor) {
      var p = preprocessor();
      Ext.apply(params, p);
  }
  if (panel && is_on_main_actor) {
      Ext.apply(params, panel.get_base_params())
  }else {
     params.{{constants.URL_PARAM_SELECTED}} = pk
  }
  Lino.insert_subst_user(params);
  var fn = function(panel, btn, step) {
    Lino.call_ajax_action(panel, meth, url, params, actionName, step, fn);
  }
  fn(panel, null, null);
}


Lino.show_detail = function(panel, btn) {
  Lino.do_on_current_record(panel, 
    function(rec) {
      //~ panel.loadMask.show();
      Lino.run_detail_handler(panel, rec.id);
    },
    Lino.show_insert
  );
};

Lino.run_detail_handler = function(panel,pk) {
  var bp = panel.get_base_params();
  panel.add_param_values(bp); // 20120918
  var status = {
    record_id:pk,
    base_params:bp
  };
  //~ console.log("20120918 Lino.show_detail",status);
  panel.ls_detail_handler.run(null,status);
};

Lino.show_fk_detail = function(combo,detail_action,insert_action) {
    //~ console.log("Lino.show_fk_detail",combo,handler);
    // pk = combo.getValue();
    pk = combo.hiddenvalue_id;
    if (pk) {
        detail_action.run(null,{record_id: pk})
      } else {
        insert_action.run(null);
        //~ Lino.notify("{{_('Cannot show detail for empty foreign key.')}}");
      }
};

Lino.show_insert = function(panel,btn) {
  var bp = panel.get_base_params();
  //~ console.log('20120125 Lino.show_insert',bp)
  //~ panel.ls_insert_handler.run(null,{record_id:-99999,base_params:bp});
  panel.ls_insert_handler.run(panel.getId(),{base_params:bp});
};

{% if settings.SITE.use_gridfilters %}


//if (Ext.ux.grid !== undefined) {
if (Ext.grid.filters.Filters !== undefined) {
    //HKC
    //Lino.GridFilters = Ext.extend(Ext.ux.grid.GridFilters,{
    Ext.define('Lino.GridFilters', {
    extend: 'Ext.grid.filters.Filters',
      encode:true,
      local:false
    });
} else {
    Lino.GridFilters = function() {}; // dummy
    // HKC
    //Ext.override(Lino.GridFilters,{
    Ext.define('Lino.GridFilters', {
    override: 'Lino.GridFilters',
      init : function() {}
    });
};

// https://stackoverflow.com/questions/26589495/extjs-remote-filtering-determine-filter-data-type-on-the-server-side

Ext.define('Ext.override.grid.filters.filter.Base', {
override: 'Ext.grid.filters.filter.Base',
createFilter: function(config, key) {
    var me = this,
        filter = me.callParent(arguments),
        type = me.getInitialConfig('type');
    filter.type = type;
    return filter;
}
});
Ext.define('Ext.override.util.Filter', {
override: 'Ext.util.Filter',
getState: function() {
    var me = this,
        state = this.callParent(arguments);
    if (me.type) {
        state.type = me.type;
    }
    return state;
}
});

{% endif %}

//    HKC Ext.data.field.Field

//Lino.FieldBoxMixin = {
Ext.define('Lino.FieldBoxMixin', {
    extend: 'Ext.data.field.Field',
  before_init : function(config,params) {
    if (params) Ext.apply(config,params);
    var actions = Lino.build_buttons(this, config.ls_bbar_actions);
    if (actions) config.bbar = actions.bbar;
  },
  //~ constructor : function(ww,config,params){
    //~ this.containing_window = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.superclass.constructor.call(this, config);
  //~ },
  do_when_clean : function(auto_save,todo) { todo() },
  //~ format_data : function(html) { return '<div class="htmlText">' + html + '</div>' },
  format_data : function(html) { return html },
  get_base_params : function() {
    // needed for insert action
    var p = Ext.apply({}, this.base_params);
    Lino.insert_subst_user(p);
    return p;
  },
  set_base_params : function(p) {
    this.base_params = Ext.apply({},p);
    //~ if (p.param_values) this.set_param_values(p.param_values);  
  },
  clear_base_params : function() {
      this.base_params = {};
      Lino.insert_subst_user(this.base_params);
  },
  set_base_param : function(k,v) {
    this.base_params[k] = v;
  }
});


Ext.define('Lino.HtmlBoxPanel', {
    extend : 'Ext.panel.Panel',
     mixins: [
         'Lino.PanelMixin',
         'Lino.FieldBoxMixin'
     ],
    scrollable:true,

  disabled_in_insert_window : true,
  constructor : function(config,params) {
    this.before_init(config,params);
      config.viewType = 'tableview';
      this.callSuper(arguments);
  },
  //~ constructor : function(ww,config,params){
    //~ this.ww = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.constructor.call(this, ww,config,params);
  //~ },
  //~ constructor : function(ww,config,params){
    //~ this.ww = ww;
    //~ if (params) Ext.apply(config,params);
    //~ var actions = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ if (actions) config.bbar = actions.bbar;
    //~ Lino.FieldBoxMixin.superclass.constructor.call(this, config);
  //~ },
  //~ disable : function() { var tb = this.getBottomToolbar(); if(tb) tb.disable()},
  //~ enable : function() { var tb = this.getBottomToolbar(); if(tb) tb.enable()},
  onRender : function(ct, position){
    // Lino.HtmlBoxPanel.superclass.onRender.call(this, ct, position);
      this.callSuper(arguments);
    //~ console.log(20111125,this.containing_window);
    if (this.containing_panel) {
      this.containing_panel.on('enable',this.enable,this);
      this.containing_panel.on('disable',this.disable,this);
    }
    this.el.on({
      dragenter:function(event){
        event.browserEvent.dataTransfer.dropEffect = 'move';
        return true;
      }
      ,dragover:function(event){
        event.browserEvent.dataTransfer.dropEffect = 'move';
        event.stopEvent();
        return true;
      }
      ,drop:{
        scope:this
        ,fn:function(event){
          event.stopEvent();
          //~ console.log(20110516);
          var files = event.browserEvent.dataTransfer.files;
          if(files === undefined){
            return true;
          }
          var len = files.length;
          while(--len >= 0){
            console.log(files[len]);
            //~ this.processDragAndDropFileUpload(files[len]);
          }
          Lino.show_insert(this);
        }
      }
    });
  },
  refresh : function(unused) {
      // this.containing_panel.refresh();
      this.refresh_with_after();
  },
  /* HtmlBoxPanel */
  refresh_with_after : function(after) {
      // var todo = this.containing_panel.refresh();
      var box = this.items.get(0);
      var todo = function() {
          var main_height = this.getHeight();
        if (this.disabled) { return; }
        this.set_base_params(this.containing_panel.get_master_params());

        var el = box.getEl();
        if (el) {
            var record = this.containing_panel.get_current_record();
            var newcontent = record ? 
                this.format_data(record.data[this.name]) : '';
            // console.log('20140917 HtmlBox.refresh()',
            //             this.name, record.data.LinksByHuman);
            // update is @deprecated in 5.0.0 ,Please use {@link #setHtml} instead.
            el.setHtml(newcontent);
            // var newHeight = el.getHeight();
            // el.setMaxHeight(newHeight);
            // if (newHeight < main_height){
            //     box.updateMaxHeight(newHeight);
            //     }
            // else {
            //     box.updateMaxHeight(main_height);
            // }
            // box.updateMaxHeight(newHeight);
        // } else {
        //     console.log('20140502 cannot HtmlBox.refresh()',this.name);
        }
      };
      //  HKC
      //Lino.do_when_visible(box, todo.createDelegate(this));
      Lino.do_when_visible(box, todo.bind(this));
  }
});
//~ Ext.override(Lino.HtmlBoxPanel,Lino.FieldBoxMixin);

// HKC
//Lino.ActionFormPanel = Ext.extend(Ext.form.FormPanel,Lino.MainPanel);
//Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, Lino.PanelMixin);
//Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, Lino.FieldBoxMixin);
//Lino.ActionFormPanel = Ext.extend(Lino.ActionFormPanel, {
Ext.define('Lino.ActionFormPanel', {
    extend : 'Ext.form.FormPanel',
     mixins: [
         //'Ext.form.FormPanel',
         'Lino.MainPanel',
         'Lino.PanelMixin',
         'Lino.FieldBoxMixin'
     ],

  //~ layout:'fit'
  //~ ,autoHeight: true
  //~ ,frame: true
  window_title : "Action Parameters",
  constructor : function(config){
    config.buttons = [
        {text: 'OK', handler: this.on_ok, scope: this},
        {text: 'Cancel', handler: this.on_cancel, scope: this}
    ];
    Lino.ActionFormPanel.superclass.constructor.call(this, config);
      //this.callSuper(arguments);
  }
  //~ ,initComponent : function(){
    //~ Lino.ActionFormPanel.superclass.initComponent.call(this);
  //~ }
  ,on_cancel : function() { 
    this.get_containing_window().close();
  }
  ,on_ok : function() { 
    var panel = this.requesting_panel;
    // var panel = this.get_containing_window().main_item;
    // console.log("20131004 on_ok",this,panel,arguments);
    var actionName = this.action_name;
    var pk = this.record_id || this.default_record_id;
    if (pk == undefined && this.base_params) { pk = this.base_params.mk; }
    if (pk == undefined && panel) {
        pk = panel.get_current_record().id;
    }
    if (pk == undefined) {
        // list actions e.g. VerifyUser, SignIn
        pk = '-99998';
        // Lino.alert("Sorry, dialog action without base_params.mk");
        // return;
    }
    var self = this;
    // function on_success() { self.get_containing_window().close(); };
    // see 20131004 and 20140430
    var url = '{{extjs.build_plain_url("api")}}';

    // 20150119 : The OK button on AgentsByClient.create_visit went to
    // /api/pcsw/Clients/ instead of /api/pcsw/Coachings/
    // if (panel) 
    //     url += panel.ls_url;
    // else 
    //     url += this.ls_url;

    if (this.ls_url) 
        url += this.ls_url;
    else 
        url += panel.ls_url;
    url += '/' + pk;
    // wrap into function to prepare possible recursive call
    var fn = function(panel, btn, step) {
      var p = {};
      self.add_field_values(p);
      if (panel) Ext.apply(p, panel.get_base_params());
      delete p.{{constants.URL_PARAM_PARAM_VALUES}};
      // console.log("20150130", p.{{constants.URL_PARAM_PARAM_VALUES}});

      Lino.call_ajax_action(
          panel, 'GET', url, p, actionName, step, fn); //  , on_success);
    };
    fn(panel, null, null);
    
    
  }
  /* ActionFormPanel*/
  ,set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    //~ console.log('20120918 ActionFormPanel.set_status()',status,rp,this.requesting_panel);
    this.clear_base_params();
    if (status == undefined) status = {};
    //~ if (status.param_values) 
    this.set_field_values(status.field_values);
    if (status.base_params) this.set_base_params(status.base_params);
    this.record_id = status.record_id;
  }
  
  ,before_row_edit : function(record) {}
  ,add_field_values : function (p) { // similar to add_param_values()
      /* LS 20160517 : Until now Lino tested whether the form is
       dirty, and if not, submitted only the values which had been set
       by set_status. But now status_field_values can be empty because
       Action.keep_user_values is True. In that case we must submit
       the current values even if the form is not dirty.  I don't
       remember why we had this feature of not submitting unmodified
       field values, so I remove this feature for now. */
      p.{{constants.URL_PARAM_FIELD_VALUES}} = this.get_field_values();
      // if (this.form.isDirty()) {
      //   p.{{constants.URL_PARAM_FIELD_VALUES}} = this.get_field_values();
      // }else{
      //   if (this.status_field_values) 
      //     p.{{constants.URL_PARAM_FIELD_VALUES}} = Lino.fields2array(this.fields,this.status_field_values);
      // }
      //~ console.log("20120203 add_param_values added pv",pv,"to",p);
  }
  ,get_field_values : function() {
      return Lino.fields2array(this.fields);
  }
  ,set_field_values : function(pv) {
      //~ console.log('20120203 MainPanel.set_param_values', pv);
      this.status_field_values = pv;
      if (pv) {
          // this.form.my_loadRecord(pv);
          this.form.setValues(pv);
          var record = { data: pv };
          this.before_row_edit(record);
      } else {
          this.form.reset(); 
          this.before_row_edit();
      }
  }
  ,config_containing_window : function(cls, wincfg) {
      wincfg.title = this.window_title;
      wincfg.keyMap.ENTER = {handler: this.on_ok,
                                scope: this};
      wincfg.keyMap.ESC = {handler: this.on_cancel,
                             scope: this};

      
      if (!wincfg.defaultButton) {
          var f = this.getForm();

          if(f.isFormField){
              wincfg.defaultButton = f;
              return false;
          }
      }

  }
});

    
Lino.fields2array = function(fields,values) {
    //~ console.log('20130605 fields2array gonna loop on', fields,values);
    var pv = Array(fields.length);
    for(var i=0; i < fields.length;i++) {
        var f = fields[i];
        if (values) 
          var v = values[f.name];
        else 
          var v = f.getValue();
        if (f instanceof Lino.ComboBox && (!Number.isInteger(v) || v == null )){
            if (f.rawValue == ""){
                pv[i] = null;
            }
            else {
                pv[i] = f.hiddenvalue_id;
            }
            // v = f.rawValue;
            // var data = f.config.store;
            // var index = 1;
            // for (var e=0 ; e < data.length ; e++){
            //     if (data[e][index] == v) {
            //         pv[i] = data[e][0];
            //         break;
            //     }
            // }
        }
        else {
            pv[i] = v; // f.getValue();
        }
        if (f.formatDate) {
            pv[i] = f.formatDate(pv[i]);
        } ;
    };
    return pv;
};


Ext.define('Lino.form.field.HtmlEditor',{
    override : 'Ext.form.field.HtmlEditor',
    // Extjs set the default value to (Non-breaking space) in Opera,
    // (Zero-width space) in all other browsers. as following.
    // defaultValue: Ext.isOpera ? '&#160;' : '&#8203;',
    // So with Opera If the user does not edit a record with HtmlEditor as at least one of its fields. Lino will
    // consider the record as Dirty (Edited by the user) which is false. To prevent this , we set the defaultValue to
    // Zero-width space for all browsers.
    defaultValue: '&#8203;',
    fixKeys: (function() {
        var tag;
        if (Ext.isIE10m) {
            return function(e) {
                var me = this,
                    k = e.getKey(),
                    doc = me.getDoc(),
                    readOnly = me.readOnly,
                    range, target;
                if (k === e.TAB) {
                    e.stopEvent();
                    // TODO: add tab support for IE 11.
                    if (!readOnly) {
                        range = doc.selection.createRange();
                        if (range) {
                            if (range.collapse) {
                                range.collapse(true);
                                range.pasteHTML('&#160;&#160;&#160;&#160;');
                            }
                            me.deferFocus();
                        }
                    }
                }
                //HKC change | Start
                else if (k == e.S && e.ctrlKey){
                    parent = this.getBubbleTarget();
                    while (parent != null && parent != undefined && !(parent instanceof Lino.FormPanel)){
                        parent = parent.getBubbleTarget();
                    }
                    if (parent != undefined){
                        parent.on_ok(e);
                    }
                    e.stopEvent();
                    e.preventDefault();
                    this.focus();
                }
                //HKC change | End
            };
        }
        if (Ext.isOpera) {
            return function(e) {
                var me = this,
                    k = e.getKey(),
                    readOnly = me.readOnly;
                if (k === e.TAB) {
                    e.stopEvent();
                    if (!readOnly) {
                        me.win.focus();
                        me.execCmd('InsertHTML', '&#160;&#160;&#160;&#160;');
                        me.deferFocus();
                    }
                }
                //HKC change | Start
                else if (k == e.S && e.ctrlKey){
                    parent = this.getBubbleTarget();
                    while (parent != null && parent != undefined && !(parent instanceof Lino.FormPanel)){
                        parent = parent.getBubbleTarget();
                    }
                    if (parent != undefined){
                        parent.on_ok(e);
                    }
                    e.stopEvent();
                    e.preventDefault();
                    this.focus();
                }
                //HKC change | End
            };
        }
        // Not needed, so null.
        return null;
    }()),
});

// Ext.define('Lino.grid.column.Check',{
//     override : 'Ext.grid.column.Check',
//     checkchange : function(rowIndex, checked, record, e, eOpts ) {
//         console.log('Ext.field.Checkbox get changes');
// },
// });
//Edited by HKC
//    Ext.define('Lino.PanelMixin', {
//    extend: 'Ext.panel.Table',
//Ext.override('Ext.form.Basic',{
Ext.define('Lino.form.Panel', {
    //extend : 'Ext.form.Panel',
    override : 'Ext.form.BasicForm',
    //xtype  : 'myview',
    my_loadRecord : function(values){
    //~ loadRecord : function(record){
        /* Same as ExtJS's loadRecord() (setValues()), except that we
        forward also the record to field.setValue() so that Lino.Combobox
        can use it.
        */
        //~ console.log('20120918 my_loadRecord',values)
        if(Ext.isArray(values)){
            for(var i = 0, len = values.length; i < len; i++){
                var v = values[i];
                var f = this.findField(v.id);
                if(f){
                    f.setValue(v.value,values);
                    if(this.trackResetOnLoad){
                        f.originalValue = f.getValue();
                    }
                }
            }
        }else{
            var field, id;
            for(id in values){
                if(!Ext.isFunction(values[id]) && (field = this.findField(id))){
                    field.setValue(values[id],values);
                    //TFP #1974
                    if (values[field.hiddenName]){
                        field.hiddenvalue_tosubmit =values[field.hiddenName];
                        field.hiddenvalue_id =values[field.hiddenName];
                        field.setHiddenValue(values[field.hiddenName])}
                        field.changed = true;
                    if(this.trackResetOnLoad){
                        field.originalValue = field.getValue();
                        if (values[field.hiddenName]) {
                          field.originalValue = values[field.hiddenName];
                         }

                    }
                }
            }
        }
        return this;
    }
});

// HKC
//Lino.FormPanel = Ext.extend(Ext.form.FormPanel,Lino.MainPanel);
//Lino.FormPanel = Ext.extend(Lino.FormPanel,Lino.PanelMixin);
//Lino.FormPanel = Ext.extend(Lino.FormPanel,{
// https://www.sencha.com/forum/showthread.php?287211-extjs5-amp-initComponent&p=1050308&viewfull=1#post1050308
Ext.define('Lino.FormPanel', {
    extend : 'Ext.form.Panel',
     mixins: [
         'Lino.PanelMixin',
         'Lino.MainPanel'
     ],

  params_panel_hidden : false,
  save_action_name : null,
  layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
  //~ base_params : {},
  //~ query_params : {},
  //~ 20110119b quick_search_text : '',
  constructor : function(config,params){
    if (params) Ext.apply(config,params);
    this.base_params = {};
    //~ ww.config.base_params.query = ''; // 20111018
    //~ console.log(config);
    //~ console.log('FormPanel.constructor() 1',config)
    //~ Ext.applyIf(config,{base_params:{}});
    //~ console.log('FormPanel.constructor() 2',config)

    config.trackResetOnLoad = true;

    Lino.FormPanel.superclass.constructor.call(this, config);
      // this.callSuper(arguments);

    //~ this.set_base_param('$URL_PARAM_FILTER',null); // 20111018
    //~ this.set_base_param('$URL_PARAM_FILTER',''); // 20111018

  },
  initComponent : function(){

    this.containing_panel = this;

    //~ console.log("20111201 containing_window",this.containing_window,this);


    var actions = Lino.build_buttons(this, this.ls_bbar_actions);
    if (actions) {
        this.bbar = actions.bbar;
    //~ } else {
        //~ this.bbar = [];
    }
    //~ Ext.apply(config,Lino.build_buttons(this,config.ls_bbar_actions));
    //~ config.bbar = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ var config = this;

    //~ if (this.containing_window instanceof Lino.DetailWrapper) {

    //~ console.log('20120121 initComponent', this.action_name);
    //~ if (this.action_name == 'detail' | this.action_name == 'show') {
    //~ if (this.action_name != 'insert') {
    if (! this.hide_top_toolbar) {
      this.tbar = [];
      // 20111015
      if (! this.hide_navigator) {
        this.record_selector = Ext.create('Lino.RemoteComboFieldElement',{
          store: Ext.create('Lino.ComplexRemoteComboStore',{
            //~ baseParams: this.containing_window.config.base_params,
            baseParams: this.get_base_params(),
            //~ value: this.containing_window.config.base_params.query,
            proxy: Ext.create('Ext.data.HttpProxy',{
              url: '{{extjs.build_plain_url("choices")}}' + this.ls_url,
              method:'GET',
              reader: {
                  type: 'json',
                  rootProperty: 'rows',
                  totalProperty: "count",
                  idProperty: this.ls_id_property,
                  keepRawData: true // LS 20151221
              },
            })
          }),
          pageSize:25,
          listeners: {
            scope:this,
            select:function(combo,record,index) {
              //~ console.log('jumpto_select',arguments);
              // this.goto_record_id(record.id);
                this.goto_record_id(record.data.value);
            }
          },
          emptyText: "{{_('Go to record')}}",
          always_enabled: true,
        });
        this.tbar = this.tbar.concat([this.record_selector]);

        this.tbar = this.tbar.concat([
            this.first = Ext.create('Ext.button.Button',{
              tooltip:"{{_('First')}}",disabled:true,
              handler:this.moveFirst,scope:this,iconCls:'x-tbar-page-first'}),
          this.prev = Ext.create('Ext.button.Button',{
              tooltip:"{{_('Previous')}}",disabled:true,
              handler:this.movePrev,scope:this,iconCls:'x-tbar-page-prev'}),
          this.next = Ext.create('Ext.button.Button',{
              tooltip:"{{_('Next')}}",disabled:true,
              handler:this.moveNext,scope:this,iconCls:'x-tbar-page-next'}),
          this.last = Ext.create('Ext.button.Button',{
              tooltip:"{{_('Last')}}",disabled:true,
              handler:this.moveLast,scope:this,iconCls:'x-tbar-page-last'})
        ]);
      }
      this.tbar = this.add_params_panel(this.tbar);

      //~ console.log(20101117,this.containing_window.refresh);
      // this.tbar = this.tbar.concat([
      //   {
          //~ text:'Refresh',
          //HKC
          //handler:function(){ this.do_when_clean(false,this.refresh.createDelegate(this)) },
          //   handler:function(){ this.do_when_clean(false,this.refresh.bind(this)) },
          // iconCls: 'x-tbar-loading',
          // tooltip:"{{_('Reload current record')}}",
          // scope:this}
      // ]);
      this.tbar = this.tbar.concat(Ext.create('Ext.button.Button',{
                tooltip:"{{_('Reload current record')}}",
                disabled:true,
                handler:function(){ this.do_when_clean(false,this.refresh.bind(this)) },
                scope:this,
                iconCls:'x-tbar-loading'}));

      if (this.bbar) { // since 20121016
        if (this.tbar) {
            this.tbar = this.tbar.concat(['-']) ;
        } else {
          this.tbar = [];
        }
        this.tbar = this.tbar.concat(this.bbar) ;
        this.bbar = undefined;
      }

      this.tbar = this.tbar.concat([
          '->',
          this.displayItem = Ext.create('Ext.Toolbar.TextItem',{})
      ]);

    }
    //~ if (this.content_type && this.action_name != 'insert') {
      //~ this.bbar = this.bbar.concat([
        //~ '->',
        //~ { text: "[$_('Help Text Editor')]",
          //~ handler: Lino.help_text_editor,
          //~ qtip: "$_('Edit help texts for fields on this model.')",
          //~ scope: this}
      //~ ])
    //~ }
    //~ this.before_row_edit = config.before_row_edit.createDelegate(this);

    //~ if (this.master_panel) {
        //~ this.set_base_params(this.master_panel.get_master_params());
    //~ }

    //  Edited by HKC
    // Lino.FormPanel.superclass.initComponent.call(this);
    this.callSuper();  // 20160630
    // this.callParent();  // 20160630

    // this.on('show',
    //         function(){ this.init_focus();},
    //         this);

    this.on('render',function(){
      //  HKC
      //this.loadMask = new Ext.create('Ext.LoadM,(this.bwrap,{msg:"{{_('Please wait...')}}"}));
        this.loadMask = Ext.create('Ext.LoadMask',{
                                        msg    : 'Please wait...',
                                        target : this,
                                    });
    },this);


    if (this.action_name == 'insert') {
      this.cascade(function(cmp){
        // console.log('20110613 cascade',cmp);
        if (cmp.disabled_in_insert_window) {
            //~ cmp.disable();
            cmp.hide();
        }
      });

    }

  },

  unused_init_focus : function(){
    // set focus to the first field
    console.log("20140205 Lino.FormPanel.init_focus");
    // Lino.FormPanel.superclass.focus.call(this);
    this.getForm().items.each(function(f){
        if(f.isFormField && f.rendered){
            f.focus();
            console.log("20140205 focus", f);
            return false;
        }
    });
  },

  /* FormPanel */
  get_status : function(){
      var st = {
        base_params: this.get_base_params(),
        // data_record : this.get_current_record()
        }
      st.record_id = this.get_current_record().id;
      // 20140917 : get_status must not store the whole data_record
      // because that would prevent the form from actually reloading
      // when set_status is called after a child window closed.

      var tp = this.items.get(0);
      if (tp instanceof Ext.TabPanel) {
        st.active_tab = tp.getActiveTab();
      }
      st.param_values = this.status_param_values;

      // find focus item and see if it's a grid view or not.
      var e = Ext.get(Ext.Element.getActiveElement())
      var p = e.parent()
      while(p){
          if (p.component){break}
//          console.log(p);
          p = p.parent();}
      if (p && p.component && p.component.id.startsWith("tableview")){
          var sel = p.component.getSelectionModel().getCurrentPosition();
          if (sel) {
                st.focus = sel;
                st.focus.rp = p.component.grid.id;
          }}
      return st;
  },

  /* FormPanel */
  set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    // console.log('20140917 FormPanel.set_status()', status);
    this.clear_base_params();
    if (status == undefined) status = {};
    //~ if (status.param_values)
    this.set_param_values(status.param_values);
    if (status.base_params) this.set_base_params(status.base_params);
    var tp = this.containing_window.items.get(0);
    if (tp instanceof Ext.TabPanel) {
      if (status.active_tab) {
        //~ console.log('20111201 active_tab',this.active_tab,this.items.get(0));
        //~ tp.activeTab = status.active_tab;
        tp.setActiveTab(status.active_tab);
        //~ this.main_item.items.get(0).activate(status.active_tab);
      } else {
        if (! status.data_record) {  // 20141206
            tp.setActiveTab(0);
        }
      }
    }

    if (status.data_record) {
      /* defer because set_window_title() didn't work otherwise */
      // 20140421 removed defer for bughunting to simplify side effects
      // this.set_current_record.createDelegate(
      //     this, [status.data_record]).defer(100);
      this.set_current_record(status.data_record);
      //~ return;
    } else {
        var record_id = status.record_id || this.default_record_id;
        if (record_id != undefined) {
          /* possible values include 0 and null, 0 being a valid record id,
          null the equivalent of undefined
          */
          this.load_record_id(record_id);
        } else {
            this.set_current_record(undefined);
        }
    }

    if (status.focus) {

        status.focus.view.grid.store.on('load', status.focus.view.grid.ensureVisibleRecord,
                              status.focus.view.grid, {row:status.focus.rowIdx,
                                                       column:status.focus.colIdx});
//        status.focus.view.grid.store.reload();
        }


    // this.init_focus();
  }
  ,get_base_params : function() {  /* FormPanel */
    // needed for insert_action
    var p = Ext.apply({}, this.base_params);
    Lino.insert_subst_user(p);
    return p;
  }
  ,set_base_params : function(p) {
    //~ this.base_params = Ext.apply({},this.base_params); // make sure it is an instance variable
    delete p['{{constants.URL_PARAM_FILTER}}'] // 20120725
    Ext.apply(this.base_params,p);
    if (this.record_selector) {
        var store = this.record_selector.getStore();
        // for (k in p) store.setBaseParam(k,p[k]);
        for (k in p) store.getProxy().setExtraParam(k,p[k]);
        delete this.record_selector.lastQuery;
        //~ console.log("20120725 record_selector.setBaseParam",p)
    }
  }
  ,clear_base_params : function() {
      this.base_params = {};
      Lino.insert_subst_user(this.base_params);
  }
  ,set_base_param : function(k,v) {
    this.base_params[k] = v;
  }
  ,after_delete : function() {
    if (this.current_record.navinfo.next)
      this.moveNext();
    else if (this.current_record.navinfo.prev)
      this.movePrev();
    else
      this.abandon();
  }
  ,moveFirst : function() {this.goto_record_id(
      this.current_record.navinfo.first)}
  ,movePrev : function() {this.goto_record_id(
      this.current_record.navinfo.prev)}
  ,moveNext : function() {this.goto_record_id(
      this.current_record.navinfo.next)}
  ,moveLast : function() {this.goto_record_id(
      this.current_record.navinfo.last)}

  ,refresh : function(unused) {
      this.refresh_with_after();
  }
  /* FormPanel */
  ,refresh_with_after : function(after) {
    // console.log('20140917 Lino.FormPanel.refresh_with_after()',this);
    if (this.current_record) {
        this.load_record_id(this.current_record.id, after);
    } else {
        this.set_current_record(undefined, after);
    }
  }

  ,do_when_clean : function(auto_save, todo) {
    var this_ = this;
    if (this.form.isDirty()) { // todo this is True for some reason when it shouldn't
        // console.log('20140421 do_when_clean : form is dirty')
        if (auto_save) {
            this_.save(todo);
        } else {
          //~ console.log('20111217 do_when_clean() form is dirty',this.form);
          var config = {title:"{{_('Confirmation')}}"};
          config.buttons = Ext.Msg.YESNO;
          config.icon = Ext.Msg.QUESTION;
          config.message = "{{_('Save changes to current record ?')}}";
          config.fn = function(buttonId) {
            //~ console.log('do_when_clean',buttonId)
            if (buttonId == "yes") {
                //~ Lino.submit_detail(this_,undefined,todo);
                //~ this_.containing_window.save(todo);
                this_.save(todo);
            } else if (buttonId == "no") {
              todo();
            }
          };
          Ext.MessageBox.show(config);
        }
    }else{
      // console.log('20140421 do_when_clean : now!')
      todo();
    }
  }

  ,goto_record_id : function(record_id) {
    // console.log('20140917 Lino.FormPanel.goto_record_id()',record_id);
    //~ var this_ = this;
    //~ this.do_when_clean(function() { this_.load_record_id(record_id) }
    this.do_when_clean(
        // HKC
        // true, this.load_record_id.createDelegate(this, [record_id]));
        // true, this.load_record_id.bind(record_id));
        true, this.load_record_id.bind(this,[record_id]));
  }

  ,load_record_id : function(record_id, after) {
    var this_ = this;
    var p = Ext.apply({}, this.get_base_params());
    if (this.action_name)
        p.{{constants.URL_PARAM_ACTION_NAME}} = this.action_name;
    p.{{constants.URL_PARAM_REQUESTING_PANEL}} = this.getId();
    p.{{constants.URL_PARAM_FORMAT}} = '{{constants.URL_FORMAT_JSON}}';
    this.add_param_values(p);
    if (this.loadMask) this.loadMask.show();
    Ext.Ajax.request({
      waitMsg: 'Loading record...',
      method: 'GET',
      params: p,
      scope: this,
      url: this.get_record_url(record_id),
      success: function(response) {
        // todo: convert to Lino.action_handler.... but result
        if (this.loadMask) this.loadMask.hide();
        if (response.responseText) {
          var rec = Ext.decode(response.responseText);
          // console.log('20150905 load_record_id success', rec);
          this.set_param_values(rec.param_values);
          this.set_current_record(rec, after);
        }
      },
      failure: Lino.ajax_error_handler(this)
    });
  }

  ,abandon : function () {
    Ext.MessageBox.alert('Note',
      "{{_('No more records to display. Detail window has been closed.')}}");
    Lino.close_window();
  }

  ,set_current_record : function(record, after) {
      // console.log('20150905 set_current_record', record);
    if (this.record_selector) {
        // HKC: disable this line to avoid getting "Save or not the record" when closing and IsDirty() is True
        //this.record_selector.clearValue();
        // e.g. InsertWrapper FormPanel doesn't have a record_selector
    }
    this.current_record = record;
    if (record && record.data) {
      this.enable();
      // this.form.my_loadRecord(record.data);
      // Todo rework record.data to find hidden_values for comboboxes and make them into models
      this.form.setValues(record.data);
      this.set_window_title(record.title);
      //~ this.getBottomToolbar().enable();
      //  console.log("HKC disable getBottomToolbar");
      var da = record.data.disabled_fields;
      if (da) {
          //~ console.log('20120528 disabled_actions =',da,this.getBottomToolbar());
          //~ 20121016 this.getBottomToolbar().items.each(function(item,index,length){
          // var tb = this.tbar;
          // var tb = this.getTopToolbar();
          var tb = this.getDockedItems()[0];
          if (tb) tb.items.each(function(item,index,length){
              //~ console.log('20120528 ',item.itemId,'-->',da[item.itemId]);
              if (da[item.itemId]) item.disable(); else item.enable();
          });
      };
if (this.disable_editing | record.data.disable_editing) {
//          console.log("20120202 disable_editing",record.title);
          this.form.getFields().each(function(cmp){
            if (!cmp.always_enabled) cmp.disable();
          },this);
      } else {
          this.form.getFields().each(function(cmp){
//            console.log("20120202");
            if (record.data.disabled_fields[cmp.name]) cmp.disable();
            else cmp.enable();
          },this);

          //~ if (record.data.disabled_fields) {
              //~ for (i = 0; i < record.data.disabled_fields.length; i++) {
                  //~ var flds = this.find('name',record.data.disabled_fields[i]);
                  //~ if (flds.length == 1) {
                    //~ flds[0].disable();
                  //~ }
              //~ }
          //~ }
      };
      if (this.first) {
        if (record.navinfo  && ! this.hide_navigator) {
          this.first.setDisabled(!record.navinfo.first);
          this.prev.setDisabled(!record.navinfo.prev);
          this.next.setDisabled(!record.navinfo.next);
          this.last.setDisabled(!record.navinfo.last);
          //this.displayItem.setText(record.navinfo.message);
          this.displayItem.text = record.navinfo.message;
        } else {
          this.first.setDisabled(true);
          this.prev.setDisabled(true);
          this.next.setDisabled(true);
          this.last.setDisabled(true);
        }
      }
    } else {
      if (this.form.rendered)
        this.form.reset(); /* FileUploadField would fail when resetting a non-rendered form */
      //~ this.disable();
      //~ this.getBottomToolbar().disable();
        //  HKC
      this.form.items.each(function(cmp){
       cmp.disable();
      },this);
      this.set_window_title(this.empty_title);
      //~ this.containing_window.window.setTitle(this.empty_title);
      if (!this.hide_navigator) {
        this.first.disable();
        this.prev.disable();
        this.next.disable();
        this.last.disable();
      }
    }
    // console.log('20140917 gonna call before_row_edit', record);
    this.before_row_edit(record);
    // console.log('20140917 gonna call after', after);
    // if (after) after();
    if (after && Ext.isFunction(after)){
        after();
    }
  },

  /* FormPanel */
  before_row_edit : function(record) {},
  search_change : function(field,oldValue,newValue) {
    //~ console.log('search_change',field.getValue(),oldValue,newValue)
    this.set_base_param('{{constants.URL_PARAM_FILTER}}',field.getValue());
    this.refresh();
  },

  get_selected : function() { return [ this.current_record ] },
  get_current_record : function() {
    //~ console.log(20100714,this.current_record);
    return this.current_record
  },

  get_permalink_url : function() {
      var rec = this.get_current_record();
      if (rec && ! rec.phantom && rec.id != -99998)
          return '{{extjs.build_plain_url("api")}}'
              + this.ls_url + '/' + rec.id;
      return '{{extjs.build_plain_url("api")}}' + this.ls_url;

  },
  add_param_tab : function(p) {
    var main = this.items.get(0);
    if (main.activeTab) {
      var tab = main.items.indexOf(main.activeTab);
      // console.log('20150130 main.activeTab', tab, main.activeTab);
      if (tab) p.{{constants.URL_PARAM_TAB}} = tab;
    // } else {
    //   console.log('20150130 no main.activeTab');
    }
  },
  get_permalink_params : function() {
    var p = {};
    //~ var p = {an:'detail'};
    if (this.action_name)
        p.{{constants.URL_PARAM_ACTION_NAME}} = this.action_name;
    this.add_param_tab(p)
    this.add_param_values(p)
    return p;
  }

  ,validate_form : function() {  // not used. see actions.ValidateForm
      // var ov = {};
      // this.form.items.each(function(f){
      //     ov[f.name] = f.originalValue
      // });

      // console.log('20140509 FormPanel.validate_form', ov);
      // var after = function() {
      //     this.form.items.each(function(f){
      //         f.originalValue = ov[f.name];
      //     });
      // }
      // this.save2(null, 'validate', after);
      this.save2(null, 'validate');
  }

  /* Lino.FormPanel */
  ,save : function(after) {
    var action_name = this.save_action_name;
    if (!action_name)
        action_name = this.action_name;
    // console.log('20140503 FormPanel.save', action_name);
    this.save2(after, action_name);
  }

  ,save2 : function(after, action_name) {
    var rec = this.get_current_record();
    if (!rec) {
        Lino.notify("Sorry, no current record.");
        return;
    }
    var panel = this;
    if (this.has_file_upload) this.form.fileUpload = true;
    this.loadMask.show();
    var p = {};
    Ext.apply(p, this.get_base_params());
    p.{{constants.URL_PARAM_REQUESTING_PANEL}} = this.getId();
    p.{{constants.URL_PARAM_ACTION_NAME}} = action_name;
    this.add_param_tab(p);
    // console.log('20150216 FormPanel.save()', rec, this.form);
    var submit_config = {
        params: p,
        scope: this,
        success: function(form, action) {
          this.loadMask.hide();
          Lino.notify(action.result.message);
          Lino.handle_action_result(this, action.result, after);
        },
        failure: function(form,action) {
          this.loadMask.hide();
          Lino.on_submit_failure(form, action);
        },
        clientValidation: true
    };
    if (rec.phantom) {  // it's a new record
      Ext.apply(submit_config, {
        url: '{{extjs.build_plain_url("api")}}' + this.ls_url,
        method: 'POST'
      });
      // panel.refresh();
      // temporarily disabled. See 20151002
    } else {  // submit on existing row
      Ext.apply(submit_config, {
        url: '{{extjs.build_plain_url("api")}}'
              + this.ls_url + '/' + rec.id,
        method: 'PUT'
      })
    }
    var form = this.getForm();
    for (i = 0; i < form.getFields().length ; i++){
        field = form.getFields().items[i];
        if (field.isDirty()){
            submit_config['params'][field.hiddenName] = field.value;
            }
    }
    form.submit(submit_config);
  }

  ,on_cancel : function() {
    this.get_containing_window().close();
  }
  ,on_ok : function(e) {
        e.stopEvent();
      // console.log("20140424");
      // this.save(null, true, this.save_action_name);
      this.save();
  }
  ,config_containing_window : function(cls, wincfg) {

      // Note that defaultButton means: which component should receive
      // focus when Window is focussed.  If no defaultButton set,
      // specify the first form field.

      //if (!wincfg.defaultButton) this.getForm().items.each(function(f){
      //    if(f.isFormField){
      //        wincfg.defaultButton = f;
              // console.log("20140205 defaultButton", f);
              //return false;
          //}
      //});
        // New feature by Extjs 6.2.0 , see http://docs.sencha.com/extjs/6.2.0/modern/Ext.mixin.Keyboard.html

{% if extjs.enter_submits_form %}
      wincfg.keyHandlers.push({
              //key: Ext.EventObject.ENTER,
                key : Ext.String.escape,
              scope:this,
              stopEvent: false,
              handler: function(k, e) {
                  // console.log("20151006", e.target.type, e.ctrlKey, e);
                  if(e.target.type === 'textarea' && !e.ctrlKey) {
                      // do default behaviour (i.e. insert a newline)
                      // console.log("20151006 default");
                      return true;
                  }
                  this.on_ok();
              }
          });
{% endif %}
        wincfg.keyMap['ESC'] = {
                 handler: 'on_cancel',
                 scope: cls,
             };
        // Cmd on Mac OS X, Ctrl on Windows/Linux.
        wincfg.keyMap['CmdOrCtrl+S'] = {
                handler: 'on_ok',
                 scope: cls,
            };
  }

});

// #1045 Allowing typing to start editing a cell.

var TypeEditResetValue = false;
// global variable for checking if we're
//wanting to clear the value of an editor when starting to edit via key-stroke

Ext.override(Ext.grid.plugin.CellEditing, {

        requires: [
            'Ext.grid.column.Column',
            'Ext.util.KeyMap'
        ],

    initEditTriggers: function() {
        var me = this,
            view = me.view;

        // Listen for the edit trigger event.
        if (me.triggerEvent === 'cellfocus') {
            me.mon(view, 'cellfocus', me.onCellFocus, me);
        } else if (me.triggerEvent === 'rowfocus') {
            me.mon(view, 'rowfocus', me.onRowFocus, me);
        } else {

            // Prevent the View from processing when the SelectionModel focuses.
            // This is because the SelectionModel processes the mousedown event, and
            // focusing causes a scroll which means that the subsequent mouseup might
            // take place at a different document XY position, and will therefore
            // not trigger a click.
            // This Editor must call the View's focusCell method directly when we recieve a request to edit
            if (view.getSelectionModel().isCellModel) {
                view.onCellFocus = me.beforeViewCellFocus.bind(me);
            }

            // We want to have an option to disable click-editing, as we use double for detail open, and single for selection
            if (me.clicksToEdit) {
            // Listen for whichever click event we are configured to use
            me.mon(view, me.triggerEvent || ('cell' + (me.clicksToEdit === 1 ? 'click' : 'dblclick')), me.onCellClick, me);
            }
        }

        // add/remove header event listeners need to be added immediately because
        // columns can be added/removed before render
        me.initAddRemoveHeaderEvents();

        // Attach new bindings to the View's NavigationModel which processes cellkeydown events.
        me.view.getNavigationModel().addKeyBindings({
            esc: me.onEscKey,
            scope: me
        });

        // Start of Edits
        view.on('render', function() {
                //bookmark
                me.keyNav = new Ext.util.KeyMap({
                    target : view.el,
                    binding:[
                    {
                        // key: [65, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],  // 0123456789 + numpad0123456789
                        key: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90 ,65, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],  // 0123456789 + numpad0123456789
                        // key: /[a-z]/,
                        // key: ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
                        handler: me.onNumberKey,
                        scope: me
                    },
                    // {
                    //     key: 13,    // ENTER
                    //     handler: me.onEnterKey,
                    //     scope: me
                    // }, {
                    //     key: 27,    // ESC
                    //     handler: me.onEscKey,
                    //     scope: me
                    // }
                ]});
            }, me, { single: true });
        //End of Edits

    },


        onNumberKey: function(e) {
            var me = this,
                grid = me.grid,
                selModel = grid.getSelectionModel(),
                record,
                columnHeader = grid.headerCt.getHeaderAtIndex(0);
//            console.log("onNumberKey");
//            console.log(e);
            // Calculate editing start position from SelectionModel
            // CellSelectionModel
            pos = this.view.ownerGrid.getNavigationModel().getPosition();
//            record = grid.store.getAt(pos.rowIdx);
            if (pos)
                {record = pos.record;
    //          columnHeader = grid.headerCt.getHeaderAtIndex(pos.columnIdx);
                columnHeader = pos.column;}
            else{
                return
            }
            /*if (selModel.getCurrentPosition) {
                pos = selModel.getCurrentPosition();
                record = grid.store.getAt(pos.row);
                columnHeader = grid.headerCt.getHeaderAtIndex(pos.column);
            }
            // RowSelectionModel
            else {
                record = selModel.getLastSelected();
            }
*/
            // if current cell have editor, then save numeric key in global variable
            var ed = me.getEditor(record, columnHeader);
            // console.log(ed.editing)
            //todo get maskre and if match open editor
            if (!ed.editing) {
//                console.log("has ed")
                // newValue = String.fromCharCode(e);
                if (ed.field && ed.field.selectOnFocus){ // There is a race condition here with selecting on keystart
                    ed.field.selectOnFocus = false;
                    setTimeout(function(ed){
                     ed.field.selectOnFocus = ed.field.config.selectOnFocus;
                    }.bind(this,ed), 100);
                    }
//                console.log("RV = true")
                TypeEditResetValue = true

            }

            // start cell edit mode
//            TypeEdit = true
            me.startEdit(record, columnHeader);
        }
});

Ext.override(Ext.Editor, {
    startEdit : function(el, value, focus) {
        var me = this,
            field = me.field;

        me.completeEdit();
//        console.log(el, value, focus);
        me.boundEl = Ext.get(el);
        value = Ext.isDefined(value) ? value : me.boundEl.dom.innerHTML;

        if (!me.rendered) {
            me.render(me.parentEl || document.body);
        }

        if (me.fireEvent('beforestartedit', me, me.boundEl, value) !== false) {
//            console.log("startEdit")
            me.startValue = value;
            me.show();
            field.reset();
            field.setValue((TypeEditResetValue ? "" : value));
            me.realign(true);
            if (focus){field.focus(false,10);}
            if (field.autoSize) {
                field.autoSize();
            }
            me.editing = true;

            // reset global newValue

//            console.log("RV = false")
            TypeEditResetValue = false;
        }
    }
});

Lino.getRowClass = function(record, rowIndex, rowParams, store) {
    //~ console.log(20130816,record);
    //~ return 'x-grid3-row-green';
    //~ return record.data.row_class + ' auto-height';
    return record.data.row_class;
  //~ if (true) {
      //~ return 'x-grid3-row-red';
  //~ }
  //~ if (record.phantom) {
    //~ console.log(20101009,record);
    //~ rowParams.bodyStyle = "color:red;background-color:blue";
    //~ return 'lino-phantom-row';
    //~ }
  //~ console.log('20101009 not a phantom:',record);
  //~ return '';
}

//~ FOO = 0;

//Edited by HKC
//Lino.GridStore = Ext.extend(Ext.data.ArrayStore,{
Lino.GridStoreConfig = {
    autoLoad: true // 20160915
    ,leadingBufferZone: 20
    ,pageSize: 35 // 20160915
    // ,buffered: true // 20160915

    ,setup_options: function(options){
        if (!options) options = {};
        if (!options.params) options.params = {};
        options.params.{{constants.URL_PARAM_FORMAT}} = '{{constants.URL_FORMAT_JSON}}';
        options.params.{{constants.URL_PARAM_REQUESTING_PANEL}} = this.grid_panel.getId();
        Lino.insert_subst_user(options.params); // since 20121016
        options.params['idParam'] = this.idParam;
        options.params['id'] = this.idParam;
        this.grid_panel.add_param_values(options.params);
        return options;
    }

    // TFP OLD CODE,
    //  , load: function(options){
    //~ foo.bar = baz; // 20120213
    // console.log("20160701 GridStore.load()", this, options);

    // var start = this.grid_panel.start_at_bottom ? -1 : 0;
    // // 20160915
    // // if (this.grid_panel.hide_top_toolbar) {
    // if (true) {
    //     //~ console.log("20120206 GridStore.load() toolbar is hidden");
    //     // options.params.{{constants.URL_PARAM_START}} = start;
    //     // if (this.grid_panel.preview_limit) {
    //     //   options.params.{{constants.URL_PARAM_LIMIT}} = this.grid_panel.preview_limit;
    //     // }
    // } else {
    //     var ps = this.grid_panel.calculatePageSize();
    //     // var ps = 15;
    //     if (!ps) {
    //       // console.log("GridStore.load() failed to calculate pagesize");
    //       return false;
    //     } 
    //     options.params.{{constants.URL_PARAM_LIMIT}} = ps;
      
    //     if (this.grid_panel.paging_toolbar) {
    //         // this.grid_panel.paging_toolbar.store.pageSize =  ps;
    //         // this.pageSize = ps;
    //         this.setConfig('pageSize', ps);
    //         // this.grid_panel.paging_toolbar.store.setConfig('pageSize', ps);
    //         // console.log(
    //         //     "20160630 GridStore.load() tbar ok", 
    //         //     this.grid_panel);
    //     } else {
    //         console.log(
    //             "20160630 GridStore.load() without tbar?!", 
    //             this.grid_panel);
    //     }
    //     if (options.params.{{constants.URL_PARAM_START}} == undefined)
    //         // if (start != -1) 
    //         //     start = this.grid_panel.getTopToolbar().cursor
    //         options.params.{{constants.URL_PARAM_START}} = start;
    //     if (options.{{constants.URL_PARAM_START}} == undefined)
    //         // if (start != -1) 
    //         //     start = this.grid_panel.getTopToolbar().cursor
    //         options.{{constants.URL_PARAM_START}} = start;
      
    //     // console.log("20141108 GridStore.load() ", options.params);
    // }
    // this.grid_panel.paging_toolbar.store.load(options.params);
    //     this.grid_panel.paging_toolbar.store.proxy.config.reader.limit = options.limit;
    //     this.grid_panel.paging_toolbar.store.proxy.config.reader.start = options.start;
    //~ Lino.insert_subst_user(options.params);
    // console.log("20160701 GridStore.load()", options.params, this.baseParams);
    // return Lino.GridStore.superclass.prefetch.call(this, options);
    //    return this.callSuper(arguments);
    //  }
  // ,insert : function(index, records) {
  //   return Ext.data.Store.prototype.insert.call(this, index, records)
    // return Lino.GridStore.superclass.insert.call(this, index, records);
  // }
};


Ext.define('Lino.GridStore', Ext.apply(Lino.GridStoreConfig,{
    extend: 'Ext.data.BufferedStore'
    // ,mixins: ['Ext.data.BufferedStore']
    //extend : 'Ext.data.ArrayStore'

    ,prefetch: function(options) {
    options = this.setup_options(options);
     return this.callSuper(arguments);
     }
}));

Ext.define('Lino.GridJsonStore', Ext.apply(Lino.GridStoreConfig,{
    extend : 'Ext.data.JsonStore'
    // ,mixins: ['Ext.data.BufferedStore']
    //extend : 'Ext.data.ArrayStore'

    ,load: function(options) {
    options = this.setup_options(options);
     return this.callSuper(arguments);
     }
}));


Lino.get_current_grid_config = function(panel) {
    return panel.get_current_grid_config();
}


// Like the default value for GridView.cellTpl but adds a class "lino-auto-height"
Lino.auto_height_cell_template = Ext.create('Ext.Template',
'<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
    '<div class="lino-auto-height x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
'</td>'
);

// Edited by HKC (Migration to Exjts6)
// EditorGridPanel does not exist any more. replaced by Ext.grid.plugin.CellEditing
//Lino.GridPanel = Ext.extend(Ext.grid.EditorGridPanel, Lino.MainPanel);
//Lino.GridPanel = Ext.extend(Ext.grid.plugin.CellEditing, Lino.MainPanel);
//Lino.GridPanel = Ext.extend(Lino.GridPanel, Lino.PanelMixin);
//Lino.GridPanel = Ext.extend(Lino.GridPanel, {
Ext.define('Lino.GridPanel', {
    extend : 'Ext.grid.Panel',
     mixins: [
         // 'Ext.grid.plugin.CellEditing',
         'Lino.MainPanel',
         'Lino.PanelMixin'
     ],

  quick_search_text : '',
  start_at_bottom : false,
  is_searching : false,
  disabled_in_insert_window : true,
  // clicksToEdit:2,  // 20160815
  enableColLock: false,
  autoHeight: false,
  params_panel_hidden : false,
  preview_limit : undefined,
  row_height: 1,
    // Height setting has no effect but to overcome the hasRange() error.
    // See : https://www.sencha.com/forum/showthread.php?304363-Buffered-Store-Fatal-HasRange-Call/page2
    height : 100,
  //~ loadMask: true,
  //~ viewConfig: {
          //~ getRowClass: Lino.getRowClass,
          //~ emptyText:"$_('No data to display.')"
        //~ },
        
        
  // loadMask: {message:"{{_('Please wait...')}}"},

  ls_focus : function(e, el){this.ensureVisible(0,{column:0,focus:true,select:true});
                             e.stopEvent();
                                                },

  constructor : function(config){
      config.plugins = [];
      config.plugins.push({
          ptype: 'cellediting',
          clicksToEdit: 0 // disabled
      });
{% if settings.SITE.use_gridfilters %}
    //config.plugins = [new Lino.GridFilters()];
    config.plugins.push(Ext.create('Lino.GridFilters',{}));
      // config.plugins.push('gridfilters');
{% endif %}
{% if settings.SITE.use_filterRow %}
      config.plugins.push(Ext.create('Ext.ux.grid.FilterRow',{}));
{% endif %}

      if (config.p){
          config.is_main_window = config.p.is_main_window;
          config.params_panel = config.p.params_panel;
          }
    /* Very strange... here we cannot use callSuper()... otherwise
     * `this` is not passed correctly... 
     */ 
    Lino.GridPanel.superclass.constructor.call(this, config);
    // this.callSuper(config);
    
    //~ if (this.containing_window) {
        //~ console.log("20111206 install refresh");
        //~ this.containing_window.on('show',this.refresh,this);
    //~ }
    
  },
  
  init_containing_window : function(win) { 
    //~ console.log("20111206 install refresh");
    //~ win.on('show',this.refresh,this);
  }

  ,handle_key_event : function(e) { 
    // console.log("20140514 handle_key_event", e, this.keyhandlers);
    var h = this.keyhandlers[e.keyCode];
    if (h) {
      h(this);
      e.stopEvent();
    }
  }
  
  ,initComponent : function(){
    
    /* 
    Problem 20111206:
    When a GridPanel is the main item of the window, then it doesn't 
    have it's own header but uses the window's header bar.
    We must do this in initComponent because e.g. in beforerender 
    it's already to late: a header element has been created because 
    there was a title.
    But Lino.Window adds itself as `this.containing_window` 
    only after the GridPanel has been initialized.
    Workaround is to generate a line "params.containing_window = true;" 
    in the handler function.
    */
    this.loadMask = Ext.create('Ext.LoadMask',{
                                        msg    : 'Please wait...',
                                        target : this,
                                    });
    if (this.is_main_window) {
        //~ console.log(20111206, 'delete title',this.title,'from',this);
        this.tools = undefined;  
        this.title = undefined;  /* simply deleting it 
          isn't enough because that would only 
          unhide the title defined in some base class. */
    } 
    //~ else console.log(20111206, 'dont delete title',this.title,'from',this);
    
    /* e.g. when slave gridwindow called from a permalink */
    //~ if (this.base_params) Ext.apply(bp,this.base_params);  
    
    var proxy = Ext.create('Ext.data.HttpProxy',{

    //var proxy = {
      // 20120814 
      url: '{{extjs.build_plain_url("api")}}' + this.ls_url
      ,method: "GET"
      ,idParam : this.ls_id_property
      ,reader: {
          type: 'json',
          rootProperty: 'rows',
          totalProperty: "count", 
          idProperty: this.ls_id_property,
          idParam : this.ls_id_property,
          keepRawData: true // LS 20151221
      }
        //type: 'ajax',
      //~ ,url: ADMIN_URL + '/restful' + this.ls_url
      //~ ,restful: true 
      //~ ,listeners: {load:on_proxy_load} 
      //~ ,listeners: {write:on_proxy_write} 
    });
    //~ config.store = new Ext.data.JsonStore({ 
    //this.store = new Ext.data.ArrayStore({

    this.store = Ext.create((!this.use_paging)?'Lino.GridStore':'Lino.GridJsonStore',{
      grid_panel: this
      ,listeners: { exception: Lino.on_store_exception }
      ,remoteSort: true
      // ,totalProperty: "count"
      // ,root: "rows"
      //~ ,id: "id"
      ,proxy: proxy
      //~ autoLoad: this.containing_window ? true : false
      ,idIndex: this.pk_index
      //~ ,baseParams: bp
      ,fields: this.ls_store_fields
      ,idProperty: this.ls_id_property
        ,idParam : this.ls_id_property
      // 20120814
      //~ ,writer : new Ext.data.JsonWriter({
        //~ writeAllFields: false
        //~ ,listful: true
      //~ })
      //~ ,restful : true
    });
      
    //~ console.log('config.pk_index',config.pk_index,config.store),
    delete this.ls_store_fields;
      
    var this_ = this;
    //~ var grid = this;
    /**
    *
    * Keep track of load operations and cancel the previous one if we get a new load request.
    * Prevents Ajax race conditions. Ticket #2136
    *
    **/
    this.store._storeOperations = []
    this.store.on('beforeload', function(theStore, operation, eOpts) {
                        var lastOperation = theStore._storeOperations.pop();
                        if (lastOperation && Ext.isFunction(operation.abort)) {
//                            console.log("aborting previous operation safely");
                            lastOperation.abort(); //this abort is safe so no need to check !lastOperation.isComplete()
                            }
                        theStore._storeOperations.push(operation); //add this operation for later usage
                        return true; //let the loading begin
                        }
                  );

    this.store.on('load', function(store, records, successful, operation, eOpts) {
        // console.log('20160701 GridStore.on(load)',
        //             this, records, successful, operation, eOpts);
        // this_.set_param_values(this_.store.reader.arrayData.param_values);
        // console.log(20151221, this_.store.getProxy().getReader());
        if (!successful && records == null){
            return
        }
        this_.set_param_values(this_.store.getProxy().getReader().rawData.param_values);
            //console.log(this_.store.getData());
         //this_.set_param_values(this_.store.first().data.rows);
        //~ this_.set_status(this_.store.reader.arrayData.status);
        //~ 20120918
        this.getView().getRowClass = Lino.getRowClass;

        if (this_.store.getProxy().getReader().rawData.no_data_text) {
            //~ this.viewConfig.emptyText = this_.store.reader.arrayData.no_data_text;
            this.getView().emptyText = this_.store.getProxy().getReader().rawData.no_data_text;
            this.getView().refresh();
        }
        if (this_.containing_window)
            this_.set_window_title(this_.store.getProxy().getReader().rawData.title);
            //~ this_.containing_window.setTitle(this_.store.reader.arrayData.title);
        /* //
        if (!this.is_searching) { // disabled 20121025: quick_search_field may not lose focus
          this.is_searching = false;
          if (this_.selModel instanceof Ext.selection.CellModel){
              if (this_.getStore().getCount()) // there may be no data
                  // this_.selModel.select(0,0);
                  this_.selModel.selectByPosition(0,0);
          } else {
              // this_.selModel.selectFirstRow();
              this_.selModel.selectByPosition(0,0);
              this_.getView().focusEl.focus();
          }
        }
        */
        //~ else console.log("is_searching -> no focussing");
        //~ var t = this.getTopToolbar();
        //~ var activePage = Math.ceil((t.cursor + t.pageSize) / t.pageSize);
        //~ this.quick_search_field.focus(); // 20121024
      }, this
    );

    this.on('afterrender', function (grid) {
      var store = grid.getStore();
      store.load({
          callback: function (){
              // snip
              console.log("19102017 afterrender");
//              var view = topicPanel.getView();
//              view.refresh();
//              topicPanel.getPlugin('bufferedrenderer').scrollTo(store.getTotalCount()-1);
           }
      });
    });

    var actions = Lino.build_buttons(this, this.ls_bbar_actions);
    //var actions;
    //~ Ext.apply(config,Lino.build_buttons(this,config.ls_bbar_actions));
    //~ config.bbar, this.cmenu = Lino.build_buttons(this,config.ls_bbar_actions);
    //~ this.cmenu = new Ext.menu.Menu({items: config.bbar});
    delete this.ls_bbar_actions;
    if (actions) {
        this.cmenu = actions.cmenu;
        this.keyhandlers = actions.keyhandlers;
    }
    
    if (!this.hide_top_toolbar) {  
      var tbar = [ 
        this.quick_search_field = Ext.create('Ext.form.TextField',{
          //~ fieldLabel: "Search"
          listeners: { 
            scope:this_
            //~ ,change:this_.search_change
            {% if settings.SITE.use_quicktips %}
            ,render: Lino.quicktip_renderer("{{_('Quick Search')}}","{{_('Enter a text to use as quick search filter')}}")
            {% endif %}
            //~ ,keypress: this.search_keypress 
            ,blur: function() { this.is_searching = false}
          }
          ,validator:function(value) { return this_.search_validate(value) }
          //~ ,tooltip: "Enter a quick search text, then press TAB"
          //~ value: text
          //~ scope:this, 
          //~ ,enableKeyEvents: true
          //~ listeners: { keypress: this.search_keypress }, 
          //~ id: "seachString"

          ,keyMap:{ENTER:{scope:this,
                          handler:this.ls_focus}
                   ,DOWN:{scope:this,
                          handler:this.ls_focus}
                          }
      })];

      tbar = this.add_params_panel(tbar);
      var menu = [];
      var set_gc = function(index) {
        return function() {
          //~ console.log('set_gc() 20100812');
          this.getColumnModel().setConfig(
              this.apply_grid_config(index,this.ls_grid_configs,this.ls_columns));
        }
      }
      for (var i = 0; i < this.ls_grid_configs.length;i++) {
        var gc = this.ls_grid_configs[i];
        menu.push({text:gc.label,handler:set_gc(i),scope:this})
      }
      if(menu.length > 1) {
        tbar = tbar.concat([
          { text:"{{_('View')}}",
            menu: menu,
            tooltip:"{{_('Select another view of this report')}}"
          }
        ]);
      }
      
      if (actions) {
        tbar = tbar.concat(actions.bbar);
          //~ this.bbar = actions.bbar;
      }

      tbar = tbar.concat(Ext.create('Ext.button.Button',{
                tooltip:"{{_('Reload current record')}}",
                handler:function(){ this.do_when_clean(false,this.refresh.bind(this)) },
                scope:this,
                iconCls:'x-tbar-loading'}));
      
      this.tbar = Ext.create('Ext.toolbar.Toolbar',{items: tbar});

      if (this.store instanceof Lino.GridJsonStore){
       this.paging_toolbar = this.tbar = Ext.create('Ext.toolbar.Paging',{
         store: this.store,
         prependButtons: true,
         // pageSize: 1,
         displayInfo: true,
         beforePageText: "{{_('Page')}}",
         afterPageText: "{{_('of {0}')}}",
         displayMsg: "{{_('Displaying {0} - {1} of {2}')}}",
         firstText: "{{_('First page')}}",
         lastText: "{{_('Last page')}}",
         prevText: "{{_('Previous page')}}",
         nextText: "{{_('Next page')}}",
         items: tbar
       });
      }
    }

     this.selModel = Ext.create('Ext.selection.RowModel', {allowDeselect:true, mode:'multi'});

     this.get_selected = function() {
        var sels = this.selModel.getSelected().items;
        if (sels.length == 0) sels = [this.store.getAt(0)];
        return sels
      };
     this.get_current_record = function() {
        var rec = this.selModel.getSelected().items;
        if (rec == undefined) rec = [this.store.getAt(0)];
        return rec[0]
      };
    this.columns  = this.apply_grid_config(this.gc_name,this.ls_grid_configs,this.ls_columns);


    this.on('resize', function(){
      //~ console.log("20120213 resize",arguments)
//      this.refresh();
      },this);
    this.on('viewready', function(){
      //~ console.log("20120213 resize",arguments);
      this.view_is_ready = true;
      this.refresh(); // removed 20130911
      },this);
    //    the 'afteredit' event doesn't exist any more. We use the 'edit' event instead.
    this.on('edit', this.on_afteredit); // 20120814
    this.on('beforeedit', this.on_beforeedit);
    this.on('beforeedit',function(e) { this.before_row_edit(e.grid.get_current_record())},this); //e is cell_editor
//    this.on('beforeedit',function(e) { this.before_row_edit(e.record)},this);
    this.on('cellcontextmenu', Lino.cell_context_menu, this);

      
    this.on('celldblclick' , this.on_celldblclick , this);
    this.on('cellkeydown' , this.on_cellkeydown , this);

    //~ this.on('contextmenu', Lino.grid_context_menu, this);
      // Lino.GridPanel.superclass.initComponent.call(this);
    this.callSuper();
    // this.callParent(); // 20160630
    
    delete this.cell_edit;


    
  },
  
  //~ onResize : function(){
      //~ console.log("20120206 GridPanel.onResize",arguments);
      //~ Lino.GridPanel.superclass.onResize.apply(this, arguments);
      //~ this.refresh();
  //~ },
  
  config_containing_window : function(cmp, wincfg){

      wincfg.keyMap.ESC = {
                            handler: function(){
                            this.get_containing_window().hide();
                                                },
                            scope :cmp}
                            },


  get_status : function(){
    var st = { base_params : this.get_base_params()};
    if (this.paging_toolbar) {
        st.current_page = this.paging_toolbar.current;
    }
    st.param_values = this.status_param_values;
    //~ console.log("20120213 GridPanel.get_status",st);
    var sel_model = this.getSelectionModel()
    if (sel_model){
        st.focus = sel_model.getCurrentPosition();
        // {view: constructor, record: constructor, row: 2, columnHeader: constructor, column: 1}
        if (st.focus) {st.focus.rp = this.id;}
        }
    return st;
  },
  
  /* 
  Lino.GridPanel.set_status() 
  */
  set_status : function(status, rp){
    this.requesting_panel = Ext.getCmp(rp);
    // console.log("20140527 GridPanel.set_status", status);
    this.clear_base_params();
    if (status == undefined) status = {base_params:{}};
    this.set_param_values(status.param_values);
    if (status.base_params) { 
      this.set_base_params(status.base_params);
    }
    if (status.show_params_panel != undefined) {
        if (this.toggle_params_panel_btn) {
            //~ this.toggle_params_panel_btn.toggle(status.show_params_panel=='true');
            this.toggle_params_panel_btn.toggle(status.show_params_panel);
        }
    }
    if (status.focus != undefined){
        /*Row selection uses rowIdx and ColIdx, cell uses row and column*/
        this.store.on('load', this.ensureVisibleRecord,this, {row:status.focus.rowIdx
//                                                              ,column:status.focus.colIdx,
                                                              });
        }
    this.refresh()


    // this.store.loadPage(1);
    // 20160915 if (this.paging_toolbar) {
    //   //~ console.log("20120213 GridPanel.getTopToolbar().changePage",
    //       //~ status.current_page || 1);
    //   // this.paging_toolbar.changePage(status.current_page || 1);
    //   this.paging_toolbar.store.loadPage(status.current_page || 1);
    //   //  var toptoolbar = this.getDockedComponent('toptoolbar');
    //   //  toptoolbar.changePage(status.current_page || 1);
    // }
    //~ this.fireEvent('resize');
    //~ this.refresh.defer(100,this); 
    //~ this.onResize.defer(100,this); 
    //~ this.refresh(); 
    //~ this.doLayout(); 
    //~ this.onResize(); 
    //~ this.store.load();
  },
  
  refresh : function(unused) { 
    this.refresh_with_after();
  },
  /* GridPanel */
  refresh_with_after : function(after) { 
    // console.log('20140504 Lino.GridPanel.refresh '+ this.store.proxy.url);
    //~ var bp = { fmt:'json' }
    if (! this.view_is_ready) return;
    
    if (this.containing_panel) {
        //~ Ext.apply(p,this.master_panel.get_master_params());
        //~ Ext.apply(options.params,this.containing_panel.get_master_params());
        this.set_base_params(this.containing_panel.get_master_params());
        // 20130911
        if (!this.store.getProxy().extraParams.{{constants.URL_PARAM_MASTER_PK}}) {
            return;
        }
    }
    
    //~ console.log('20130911 Lino.GridPanel.refresh_with_after',this.containing_panel.get_master_params());
    
    var options = {};
    if (after) {
        options.callback = function(r,options,success) {if(success) after()}
    }
      
    //~ if (!this.rendered) {
        //~ console.log("20120206 GridPanel.refresh() must wait until rendered",options);
        //~ this.grid_panel.on('render',this.load.createDelegate(this,options))
        //~ return;
    //~ }
     // Ticket 802
    if (this.store.lastOptions != undefined){
        var params = {};
        params.limit = this.store.lastOptions.params.limit;
        params.start = this.store.lastOptions.params.start;
        options.params = params;
    }
    
    this.store.load(options);
  },
  
  /* The pageSize (number of grid rows to display) depends on the
   * height of the grid widget so that there is usually no vertical
   * scrollbar.

  Thanks to 
  - Christophe Badoit on http://www.sencha.com/forum/showthread.php?82647
  - http://www.sencha.com/forum/archive/index.php/t-37231.html

   20160628 In ExtJS 3 we had a trick to compute the exact height of a
   row, but that trick fails with ExtJS 6. We want to know the number
   of grid rows that will fit into the grid before actually requesting
   any data from the server.  The store is not yet loaded. We don't
   want the height of *every* data row. The trick is to create a
   volatile DOM element with the same CSS as a grid cell and with
   `<br/>` as content. And instead of displaying this element, we just
   note its height.

  */
  calculatePageSize : function(second_attempt) {
      //~ if (!this.rendered) { 
      if (!this.view_is_ready) { 
          //~ console.log('Cannot calculatePageSize() : not rendered');
          return false; }
      //~ if (!this.isVisible()) { 
      //~ console.log('calculatePageSize : not visible');
      //~ return false; }
      
      //~ console.log('getFrameHeight() is',this.getFrameHeight());
      //~ console.log('getView().scroller.getHeight() is',this.getView().scroller.getHeight());
      //~ console.log('mainBody.getHeight() is',this.getView().mainBody.getHeight());
      //~ console.log('getInnerHeight() is',this.getInnerHeight());
      //~ console.log('getHeight() is',this.getHeight());
      //~ console.log('el.getHeight() is',this.getEl().getHeight());
      //~ console.log('getGridEl().getHeight() is',this.getGridEl().getHeight());
      //~ console.log('getOuterSize().height is',this.getOuterSize().height);
      //~ console.log('getBox().height is',this.getBox().height);
      //~ console.log('getResizeEl.getHeight() is',this.getResizeEl().getHeight());
      //~ console.log('getLayoutTarget().getHeight() is',this.getLayoutTarget().getHeight());
      
      // var gb = this.body.query('.x-grid-body');
      // console.log("20160629a ", gb);  //.getHeight()


      //~ this.getView().syncScroll();
      //~ this.getView().initTemplates();


    // var height = this.getViewRegion().getSize().height;
    // var height = this.getHeight();
    // var height = this.getView().scroller.getHeight();  // 20160628
    //~ console.log('getView().scroller.getHeight() is',this.getView().scroller.getHeight());
    //~ console.log('getInnerHeight() - getFrameHeight() is',
      //~ this.getInnerHeight(), '-',
      //~ this.getFrameHeight(), '=',
      //~ this.getInnerHeight() - this.getFrameHeight());
    //~ var height = this.getView().mainBody.getHeight();
    //~ var height = this.getView().mainWrap.getHeight();
    //~ var height = this.getView().resizeMarker.getHeight();
    //~ this.syncSize();
    //~ var height = this.getInnerHeight() - this.getFrameHeight();
    //~ var height = this.getHeight() - this.getFrameHeight();
    // height -= Ext.getScrollBarWidth(); // leave room for a possible horizontal scrollbar...
    // height -= 10; // leave room for a possible horizontal scrollbar...
    //~ height -= this.getView().scrollOffset;

     var gb = this.body.selectNode('.x-grid-view', false);
     // console.log("20160629a ", gb.getHeight());
     var height = gb.getHeight();

     // var gb = this.body.selectNode('.x-column-header', false);
     // console.log("20160629b ", gb);

    //~ var rowHeight = 52; // experimental value
    // var rowHeight = this.row_height * 11;

     if (true) {
        // use hard-coded experimental value
        var rowHeight = 22 * this.row_height;  
        // TODO: change value in function of browser zoom level. Check
        // whether other themes have other values.
     } else {
         var row_content = 'X';
         for (var i = 0; i < this.row_height;i++) {
             row_content += '<br>';
         }
         if (false) {
             var Element = Ext.Element;
             var gv = this.view;
             var rowTemplate = gv.rowTpl;
             var cellTemplate = gv.cellTpl;
             // var tstyle  = 'width:' + gv.getGridInnerWidth() + 'px;';
             //   var tstyle  = 'width:' + gv.getWidth() + 'px;';
             var tstyle  = 'width: 20px;';
             
             // var fakeBody = new Element(document.createElement('div'));
             // fakeBody = fakeBody.child('tr.x-grid-row');
             // var fakeBody = new Element(Element.fly(gv.body).child('x-grid-item-container'));
             //   .child('div.x-grid-view')
             // var fakeBody = Ext.get(Element.fly(this.body));
             // console.log("20160615", this.fake_row_content);
             var cells = cellTemplate.apply({
                 value: row_content,
                 itemClasses: [],
                 column: { cellWidth: 'foo',
                           getItemId : function() {} }
             });
             var markup = rowTemplate.apply({
                 view: { id: 'bar' },
                 record: {internalId: 'baz'},
                 itemClasses: [],
                 tstyle: tstyle,
                 cols  : 1,
                 cells : cells,
                 alt   : ''
             });
             markup = gv.tpl.apply({rows: markup});
             console.log("20160629 ", 
                         gv.rowTpl.html, gv.cellTpl.html, markup);
             // fakeBody.dom.innerHTML = markup;
             // var row = fakeBody.dom.childNodes[0];
             var rowHeight = fakeBody.getHeight();
         }
         if (false) {
             var el = new Ext.Element(document.createElement('div'));
             el.dom.innerHTML = row_content;
             var rowHeight = el.getHeight();
             
             // var el = document.createElement('div')
             // var t = document.createTextNode(row_content);
             // el.appendChild(t);
             // var rowHeight = el.clientHeight;
             
             // var row = this.view.getNode(0);
             // var rowHeight = Ext.get(row).getHeight();
         }
     }
    
     //~ console.log('rowHeight is ',rowHeight,this,caller);
     if (height < rowHeight) return false;
      var ps = Math.floor(height / rowHeight);
      // console.log('20160628 calculatePageSize():',height,'/',rowHeight,'->',ps);
    ps -= 1; // leave room for a possible phantom row
    //~ return (ps > 1 ? ps : false);
    if (ps > 1) return ps;
    //~ console.log('calculatePageSize() found less than 1 row:',height,'/',rowHeight,'->',ps);
    //~ foo.bar = baz; // 20120213
    return 5; // preview_limit
    //~ if (second_attempt) {
        //~ console.log('calculatePageSize() abandons after second attempt:',
          //~ height,'/',rowHeight,'->',ps);
      //~ return 5;
    //~ }
    //~ return this.calculatePageSize.defer(500,this,[true]);
  },

    on_celldblclick : function(view, record, item, index, e, eOpts ){


      if (this.ls_detail_handler) {
          //~ Lino.notify('show detail');
          if (index.crudState != "C") {Lino.show_detail(this);}
          else if (this.ls_insert_handler) {Lino.show_insert(this);}
          else { this.editingPlugin.startEditByPosition({row: eOpts,
                                                         column: item})}
          return false;
      }
      else {
          if (index.crudState == "C"){ //end row
            if (this.ls_insert_handler){ Lino.show_insert(this);
                                         return false;}
            }
          this.editingPlugin.startEditByPosition({row: eOpts,
                                                         column: item})
          return false;

      }
    }

    ,on_cellkeydown : function ( view , td , cellIndex , record , tr , rowIndex , e , eOpts ) {
        this.handleKeyDown(e,cellIndex,rowIndex,view,record,tr,td);

    },
    handleKeyDown : function(e,c, r,g,record,tr,td){
        /* removed because F2 wouldn't pass
        if(!e.isNavKeyPress()){
            return;
        }
        */
//        console.log('handleKeyDown',e)
        var k = e.getKey(),
            // g = this.grid,
            s = this.selection,
            sm = this,
            walk = function(step){
                return g.walkCells(
                    e.position,
                    step
                );
            },
            cell, newCell, r, c, ae;
        // Are we editing a cell ?
        if (this.editingPlugin != undefined && this.editingPlugin.editing ){
            return;
        }

        switch(k){
            case e.ESC: // Also in the window's scope
                this.get_containing_window().hide();
                e.stopEvent();
                break;
            case e.PAGE_UP:
            case e.INSERT:
                if (e.ctrlKey){
                    Lino.copyToClipboard(e.target.innerText);
                }
                break;
            case e.C:
                if (e.ctrlKey){
                    Lino.copyToClipboard(e.target.innerText);
                }
                break;
            case e.PAGE_DOWN:
                break;
            default:
                // e.stopEvent(); // removed because Browser keys like Alt-Home, Ctrl-R wouldn't work
                break;
        }

        if(!s){
            newCell = walk('up');
            // if(cell){
            //     this.select(cell[0], cell[1]);
            // }
            // return;
        }

        // cell = s.cell;
        // r = cell[0];
        // c = cell[1];

        switch(k){
            case e.TAB:
                if(e.shiftKey){
                    newCell = walk('left');
                }else{
                    newCell = walk('right');
                }
                break;
            case e.HOME:
                if (! (g.isEditor && g.editing)) {
                  if (!e.hasModifier()){
                      newCell = [r, 0];
                      //~ console.log('home',newCell);
                      break;
                  }else if(e.ctrlKey){
                      var t = g.getTopToolbar();
                      var activePage = Math.ceil((t.cursor + t.pageSize) / t.pageSize);
                      if (activePage > 1) {
                          e.stopEvent();
                          t.moveFirst();
                          return;
                      }
                      newCell = [0, c];
                      break;
                  }
                }
            case e.END:
                if (! (g.isEditor && g.editing)) {
                  c = g.colModel.getColumnCount()-1;
                  if (!e.hasModifier()) {
                      newCell = [r, c];
                      //~ console.log('end',newCell);
                      break;
                  }else if(e.ctrlKey){
                      var t = g.getTopToolbar();
                      var d = t.getPageData();
                      if (d.activePage < d.pages) {
                          e.stopEvent();
                          var self = this;
                          t.on('change',function(tb,pageData) {
                              var r = g.store.getCount()-2;
                              self.select(r, c);
                              //~ console.log('change',r,c);
                          },this,{single:true});
                          t.moveLast();
                          return;
                      } else {
                          newCell = [g.store.getCount()-1, c];
                          //~ console.log('ctrl-end',newCell);
                          break;
                      }
                  }
                }
            case e.DOWN:
                newCell = walk('down');
                break;
            case e.UP:
                newCell = walk('up');
                break;
            case e.RIGHT:
                newCell = walk('right');
                break;
            case e.LEFT:
                newCell = walk('left');
                break;
            case e.F2:
                if (!e.hasModifier()) {
                    // https://gist.github.com/zerkms/2572486 to add a key trigger.
                    if (!g.editingPlugin.editing) {
                        var columnId = g.getSelectionModel().getCurrentPosition().column,
                            // record = g.getSelectionModel().selection.record,
                            record = g.getSelectionModel().selected.items[0],
                            header = g.getHeaderAtIndex(columnId),
                            view = g,
                            cell = td,
                            cellIndex = c,
                            record = record,
                            row = tr,
                            recordIndex = r,
                            mousedownEvent = e;


                        g.getSelectionModel().navigationModel.onCellMouseDown(view, cell, cellIndex, record, row, recordIndex, mousedownEvent);

                        // me.startEdit(record, header);
                        // g.editingPlugin.startEditByPosition(g.getSelectionModel().getCurrentPosition());
                        // editor.startEdit(e.position.cellElement);
                        e.stopEvent();
                        return;
                    }
                    break;
                }
            case e.INSERT:
                if (!e.hasModifier()) {
                    if (g.ls_insert_handler && !g.editing) {
                        e.stopEvent();
                        Lino.show_insert(g);
                        return;
                    }
                    break;
                }
            // case e.DELETE:
            //     if (!e.hasModifier()) {
            //         if (!g.editing) {
            //             e.stopEvent();
            //             Lino.delete_selected(g);
            //             return;
            //         }
            //         break;
            //     }

            case e.ENTER:
                e.stopEvent();
                g.onCellDblClick(r,c);
                break;

            default:
                this.handle_key_event(e);

        }


        if(false){
//        if(newCell){
          e.stopEvent();
          r = newCell.rowIdx;
          c = newCell.colIdx;
          // this.select(r, c);
            g.getSelectionModel().setPosition({
                          row: r,
                          column: c
                      }, true);
            g.getSelectionModel().select({
                          row: r,
                          column: c
                      });
            // g.getSelectionModel().refresh();
            e.stopEvent();
            // this.selModel.select(r,c);
          if(g.isEditor && g.editing){
            ae = g.activeEditor;
            if(ae && ae.field.triggerBlur){
                ae.field.triggerBlur();
            }
            g.startEditing(r, c);
          }
        //~ } else if (g.isEditor && !g.editing && e.charCode) {
        //~ // } else if (!e.isSpecialKey() && g.isEditor && !g.editing) {
            //~ g.set_start_value(String.fromCharCode(e.charCode));
            //~ // g.set_start_value(String.fromCharCode(k));
            //~ // g.set_start_value(e.charCode);
            //~ g.startEditing(r, c);
            //~ // e.stopEvent();
            //~ return;
        // } else {
          // console.log('20120513',e,g);
        }

    }
  ,get_base_params : function() {  /* Lino.GridPanel */
    // var p = Ext.apply({}, this.store.baseParams);
    var p = Ext.apply({}, this.store.getProxy().extraParams);
    Lino.insert_subst_user(p);
    return p;
  },
  set_base_params : function(p) {
    // console.log('20130911 GridPanel.set_base_params',p)
    // for (k in p) this.store.setBaseParam(k,p[k]);
    for (k in p) this.store.getProxy().setExtraParam(k,p[k]);
    //~ this.store.baseParams = p;
    if (this.quick_search_field)
      this.quick_search_field.setValue(p.query || "");
    //~ if (p.param_values) 
        //~ this.set_param_values(p.param_values);  
  },
  clear_base_params : function() {
      // this.store.baseParams = {};
      // Lino.insert_subst_user(this.store.baseParams);
      this.store.getProxy().extraParams = {};
      Lino.insert_subst_user(this.store.getProxy().extraParams);
  },
  set_base_param : function(k,v) {
      // HKC
      // this.store.setBaseParam(k,v);
      this.store.getProxy().setExtraParam(k, v);
      // var options = {};
      // this.store.load(options);
  },
  
  //~ get_permalink_params : function() {
    //~ var p = {};
    //~ return p;
  //~ },
  
  before_row_edit : function(record) {},
    
  //~ search_keypress : function(){
    //~ console.log("2012124 search_keypress",arguments);
  //~ },
  search_validate : function(value) {
    if (value == this.quick_search_text) return true;
    this.is_searching = true;
    //~ console.log('search_validate',value)
    this.quick_search_text = value;
    this.set_base_param('{{constants.URL_PARAM_FILTER}}',value); 
    //~ this.getTopToolbar().changePage(1);
    // 20160915 this.paging_toolbar.moveFirst();
    this.refresh();
    return true;
  },
  
  search_change : function(field,oldValue,newValue) {
    //~ console.log('search_change',field.getValue(),oldValue,newValue)
    this.set_base_param('{{constants.URL_PARAM_FILTER}}',field.getValue()); 
    // 20160915 this.paging_toolbar.moveFirst();
    this.refresh();
  },
  
  apply_grid_config : function(index,grid_configs,rpt_columns) {
    // Dead code, not in use any more, user grid_configs are disabled.
    //~ var rpt_columns = this.ls_columns;
    var gc = grid_configs[index];    
    //~ console.log('apply_grid_config() 20100812',name,gc);
    this.gc_name = index;
    if (gc == undefined) {
      return rpt_columns;
      //~ config.columns = config.ls_columns;
      //~ return;
    } 
    //~ delete config.ls_filters
    
    //~ console.log(20100805,config.ls_columns);
    var columns = Array(gc.columns.length);
    for (var j = 0; j < rpt_columns.length;j++) {
      var col = rpt_columns[j];
      for (var i = 0; i < gc.columns.length; i++) {
        if (col.dataIndex == gc.{{constants.URL_PARAM_COLUMNS}}[i]) {
          col.width = gc.{{constants.URL_PARAM_WIDTHS}}[i];
          col.hidden = gc.{{constants.URL_PARAM_HIDDENS}}[i];
          columns[i] = col;
          break;
        }
      }
    }
    
    //~ var columns = Array(rpt_columns.length);
    //~ for (var i = 0; i < rpt_columns.length; i++) {
      //~ columns[i] = rpt_columns[gc.columns[i]];
      //~ columns[i].width = gc.widths[i];
    //~ }
    
    //~ if (gc.hidden_cols) {
      //~ for (var i = 0; i < gc.hidden_cols.length; i++) {
        //~ var hc = gc.hidden_cols[i];
        //~ for (var j = 0; j < columns.length;j++) {
          //~ var col = columns[j];
          //~ if (col.dataIndex == hc) {
            //~ col.hidden = true;
            //~ break
          //~ }
        //~ }
      //~ }
    //~ }
    if (gc.filters) {
      //~ console.log(20100811,'config.ls_filters',config.ls_filters);
      //~ console.log(20100811,'config.ls_grid_config.filters',config.ls_grid_config.filters);
      for (var i = 0; i < gc.filters.length; i++) {
        var fv = gc.filters[i];
        for (var j = 0; j < columns.length;j++) {
          var col = columns[j];
          if (col.dataIndex == fv.field) {
            //~ console.log(20100811, f,' == ',fv);
            if (fv.type == 'string') {
              col.filter.value = fv.value;
              //~ if (fv.comparison !== undefined) f.comparison = fv.comparison;
            } else {
              //~ console.log(20100811, fv);
              col.filter.value = {};
              col.filter.value[fv.comparison] = fv.value;
            }
            break;
          }
        };
      }
    }
    
    return columns;
    //~ config.columns = cols;
    //~ delete config.ls_columns
  },
  
  get_current_grid_config : function () {
    var cm = this.getColumns();
    // var cm = this.getView().getHeaderCt().getGridColumns();
    var widths = Array(cm.length);
    var hiddens = Array(cm.length);
    //~ var hiddens = Array(cm.config.length);
    var columns = Array(cm.length);
    //~ var columns = Array(cm.config.length);
    //~ var hidden_cols = [];
    //~ var filters = this.filters.getFilterValues();
    // var p = this.filters.buildQuery(this.filters.getFilterData())
    //   var p = this.filters.store.filters.filterBy(this.filters.store.filters);
      var p = {};
      // var p = this.store.proxy.encodeFilters(this.store.getFilters().items);
    for (var i = 0; i < cm.length; i++) {

      var col = cm[i];
          columns[i] = col.dataIndex;
          //~ hiddens[i] = col.hidden;
          widths[i] = col.cellWidth;
          hiddens[i] = col.hidden;

      //~ if (col.hidden) hidden_cols.push(col.dataIndex);
    }
    //~ p['hidden_cols'] = hidden_cols;
    p.{{constants.URL_PARAM_WIDTHS}} = widths;
    p.{{constants.URL_PARAM_HIDDENS}} = hiddens;
    p.{{constants.URL_PARAM_COLUMNS}} = columns;
    //~ p['widths'] = widths;
    //~ p['hiddens'] = hiddens;
    //~ p['columns'] = columns;
    p['name'] = this.gc_name;
    //~ var gc = this.ls_grid_configs[this.gc_name];
    //~ if (gc !== undefined) 
        //~ p['label'] = gc.label
    //~ console.log('20100810 save_grid_config',p);
    return p;
  },
  
  on_beforeedit : function(editor, context, eOpts) {
    // console.log('20130128 GridPanel.on_beforeedit()',e,e.record.data.disable_editing);
      var record = context.record;
    if(this.disable_editing | record.data.disable_editing) {
      context.cancel = true;
      Lino.notify("{{_("This record is disabled")}}");
      return;
    }
    if(record.data.disabled_fields && record.data.disabled_fields[context.field]) {
      context.cancel = true;
      Lino.notify("{{_("This field is disabled")}}");
      return;
    }
    //~ if (e.record.data.disabled_fields) {
      //~ for (i in e.record.data.disabled_fields) {
        //~ if(e.record.data.disabled_fields[i] == e.field) {
          //~ e.cancel = true;
          //~ Lino.notify(String.format('Field "{0}" is disabled for this record',e.field));
          //~ return
        //~ }
      //~ }
    //~ }
  },
  save_grid_data : function() {
      //~ console.log("20120814 save_grid_data");
      this.getStore().commitChanges();
  },
  on_afteredit : function(editor, context, eOpts) {
    /*
    e.grid - The grid that fired the event
    e.record - The record being edited
    e.field - The field name being edited
    e.value - The value being set
    e.originalValue - The original value for the field, before the edit.
    e.row - The grid row index
    e.column - The grid column index
    */
    e = context;
    var p = {};
    // console.log('20140403 afteredit: ',e.record);
    //~ console.log('20101130 value: ',e.value);
    //~ var p = e.record.getChanges();
    //~ console.log('20101130 getChanges: ',e.record.getChanges());
    //~ this.before_row_edit(e.record);
    if (e.value === e.originalValue){return;}
    for(k in e.record.getChanges()) {
        var v = e.record.get(k);
    //~ for(k in e.record.modified) {
        //~ console.log('20101130',k,'=',v);
        //~ var cm = e.grid.getColumnModel();
        //~ var di = cm.getDataIndex(k);
        // var f = e.record.fields.get(k);
        var f = null;
        for(_f in e.record.fields) {
            if (e.record.fields[_f].name == k){
                f = e.record.fields[_f];
            }
        }
            // var f = e.record.fields[k];
        //~ console.log('20101130 f = ',f);
        //~ var v = e.record.get(di);
        if (f.__proto__.$className == 'Ext.data.field.Field') {
        // if (f.type.type == 'date') {
        //     p[k] = Ext.util.Format.date(v, f.dateFormat);
            if (typeof v == "string"){
                p[k] = v;
            }
            else {
                p[k] = Ext.util.Format.date(v, '{{settings.SITE.time_format_extjs}}');
            }
        }else if (f.__proto__.$className == 'Ext.data.field.Date'){
            p[k] = Ext.util.Format.date(v, f.dateFormat);
        }else{
            p[k] = v;
            var v = e.record.get(k+'{{constants.CHOICES_HIDDEN_SUFFIX}}');
            if (v !== undefined) {
              p[k+'{{constants.CHOICES_HIDDEN_SUFFIX}}'] = v;
            }
        }
    }
    // add value used by ForeignKeyStoreField CHOICES_HIDDEN_SUFFIX
    // not sure whether this is still needed:
    p[e.field+'{{constants.CHOICES_HIDDEN_SUFFIX}}'] = e.value;
    //~ p.{{constants.URL_PARAM_SUBST_USER}} = Lino.subst_user;
    Lino.insert_subst_user(p);
    // this one is needed so that this field can serve as choice context:
    e.record.data[e.field+'{{constants.CHOICES_HIDDEN_SUFFIX}}'] = e.value;
    // p[pk] = e.record.data[pk];
    // console.log("grid_afteredit:",e.field,'=',e.value);
    Ext.apply(p, this.get_base_params()); // needed for POST, ignored for PUT
    //~ Ext.apply(p,this.containing_window.config.base_params);
    //~ 20121109 p['$constants.URL_PARAM_ACTION_NAME'] = 'grid';
    var self = this;
    var req = {
        params:p,
        waitMsg: 'Saving your data...',
        success: Lino.action_handler( this, function(result) {
          // console.log("20140728 afteredit.success got ", result);
          //~ if (result.data_record) {
          if (result.refresh_all) {
              var cw = self.get_containing_window();
              if (cw) {
                  cw.main_item.refresh();
              }
              else console.log("20120123 cannot refresh_all",self);
          } else if (result.rows) {
              //~ self.getStore().loadData(result,true);
              // var r = self.getStore().reader.readRecords(result);
              var r = self.getStore().proxy.reader.readRecords(result);
              // if (e.record.phantom) {
                  // console.log("20140728 gonna call Store.insert()", self.getStore(), e.row, r.records);
                  // self.getStore().insert(e.row, r.records);
              // }else{
                  // console.log("20140728 afteredit.success doUpdate", r.records[0]);
                  // self.getStore().doUpdate(r.records[0]);
              // }
              // self.getStore().rejectChanges();
              /* 
              get rid of the red triangles without saving the record again
              */
              //~ self.getStore().commitChanges(); // get rid of the red triangles
              // self.getStore().commitChanges(); // get rid of the red triangles
//              self.getStore().reload();        // reload our datastore.
              // Thanks to http://vadimpopa.com/reload-a-single-record-and-refresh-its-extjs-grid-row/
              var store = self.getStore();
              var recToUpdate = store.getById(r.records[0].id);
//              var recToUpdate = store.getById(this.e.record.id);  // #2041 Editor might change before ajax return
              if (recToUpdate != null){
                  recToUpdate.set(r.records[0].getData());
                  recToUpdate.commit(false);
                  self.getView().refreshNode(store.indexOfId(e.record.id));
                  var pos = self.getNavigationModel().getPosition();
                  if (e.rowIdx == pos.rowIdx
                  &&  e.colIdx == pos.colIdx){  // If user closed editor via [Enter] rather then click away,
//                  self.getView.focusRow(row);
                    // Focus on that cell only if it's already selected, not if user has clicked away.
                    self.getView().getNavigationModel().setPosition(e.rowIdx, e.colIdx);
                    }
              }
              else{


                self.store.on('load', self.ensureVisibleRecord,self, {row:result.navinfo.recno - 1});
                self.store.reload();
              }
//              store.reload();
//
//              // self.getStore().sync(); // get rid of the red triangles
//              // self.getStore().reload();        // reload our datastore.

//              e.record.set(r.records[0].getData());
//              self.getView().refreshNode(self.getStore().indexOfId(e.record.id));
//              e.record.commit();
          } else {
              self.getStore().sync(); // get rid of the red triangles
//              self.getStore().commitChanges(); // get rid of the red triangles
              self.getStore().reload();        // reload our datastore.
          }
          }),
        scope: this,
        failure: Lino.ajax_error_handler(this)
    };
    // The 'e.record.phantom' flag has already been removed because
    // for ExtJS is is no longer a phantom record.
    if (typeof(e.record.id) == "string" && e.record.id.startsWith("extModel")){
      req.params.{{constants.URL_PARAM_ACTION_NAME}} = 'grid_post'; // CreateRow.action_name
      Ext.apply(req,{
        method: 'POST',
        url: '{{extjs.build_plain_url("api")}}' + this.ls_url
      });
    } else {
      req.params.{{constants.URL_PARAM_ACTION_NAME}} = 'grid_put'; // SaveRow.action_name
      Ext.apply(req,{
        method: 'PUT',
        url: '{{extjs.build_plain_url("api")}}' + this.ls_url + '/' + e.record.id
      });
    }
    //~ console.log('20110406 on_afteredit',req);
    // this.loadMask.show(); // 20120211
      this.loadMask.show();
    Ext.Ajax.request(req);
      this.loadMask.hide();
  },

  unused_afterRender : function() {
    //Lino.GridPanel.superclass.afterRender.call(this);
      this.callSuper();
    // this.getView().mainBody.focus();
    // console.log(20100114,this.getView().getRows());
    // if (this.getView().getRows().length > 0) {
    //  this.getView().focusRow(1);
    // }
    //~ this.my_load_mask = new Ext.LoadMask(this.getEl(), {
        //~ msg:'$_("Please wait...")',
        //~ store:this.store});
    if (this.paging_toolbar) {
        var tbar = this.paging_toolbar;
        // //  Edited by HKC
        // var tbar = this.getDockedComponent('toptoolbar');

        // tbar.on('change',function() {this.getView().focusRow(1);},this);
        // tbar.on('change',function() {this.getSelectionModel().selectFirstRow();this.getView().mainBody.focus();},this);
        // tbar.on('change',function() {this.getView().mainBody.focus();},this);
        // tbar.on('change',function() {this.getView().focusRow(1);},this);
        this.nav = new Ext.KeyNav(this.getEl(),{
          pageUp: function() {tbar.movePrevious(); },
          pageDown: function() {tbar.moveNext(); },
          home: function() {tbar.moveFirst(); },
          end: function() {tbar.moveLast(); },
          scope: this
        });
        }
    },

  // bind to the store's 'load' event to select a row after a refresh
  // the oOpts.row is the row position of the row to be selected + focused
  // The scope should be the grid
  ensureVisibleRecord : function (store, records, successful, eOpts) {
//    console.log("#2010 30102017 Make vis: ",eOpts, )
    eOpts = arguments[arguments.length-1]; // different args for Buffered Store and normal
    this.getSelectionModel().deselectAll()
    this.ensureVisible(eOpts.row,
                            {column:eOpts.column,
                             select:true,
                             // highlight:true, // If used with select causes the selection box to be delayed slightly
                             focus:true,
                             callback: function(s,r,n){
                                var med = Math.floor(this.view.getHeight() / 21 /2) + eOpts.row; /*Half the viewport*/
//                                 console.log("Callback",med,eOpts.row, s,r,n);
                                 this.ensureVisible(med);
                                 }
                             });
    this.store.un("load", this.ensureVisibleRecord, this);
  },
  after_delete : function() {
    //~ console.log('Lino.GridPanel.after_delete');
    this.refresh();
  },
  add_row_listener : function(fn,scope) {
    this.getSelectionModel().addListener('rowselect',fn,scope);
  },
  postEditValue : function(value, originalValue, r, field){
    //value = Lino.GridPanel.superclass.postEditValue.call(this,value,originalValue,r,field);
      this.callSuper(value,originalValue, r, field);
    //~ console.log('GridPanel.postEdit()',value, originalValue, r, field);
    return value;
  },
  
  set_start_value : function(v) {
      this.start_value = v;
  },
  preEditValue : function(r, field){
      if (this.start_value) {
        var v = this.start_value;
        delete this.start_value;
        this.activeEditor.selectOnFocus = false;
        return v;
      }
      var value = r.data[field];
      return this.autoEncode && Ext.isString(value) ? Ext.util.Format.htmlDecode(value) : value;
  },
  
  on_master_changed : function() {
    //~ if (! this.enabled) return;
    //~ cmp = this;
    //~ console.log('20130911 Lino.GridPanel.on_master_changed()',this.title,this.rendered);
    if (! this.rendered) return; // 20120213
    var todo = function() {
      if (this.disabled) return;
      //~ if (this.disabled) return;
      //~ if (this.enabled) {
          //~ var src = caller.config.url_data + "/" + record.id + ".jpg"
          //~ console.log(20111125, this.containing_window);
          //~ for (k in p) this.getStore().setBaseParam(k,p[k]);
          //~ console.log('Lino.GridPanel.on_master_changed()',this.title,p);
          this.refresh();
          //~ this.set_base_params(this.master_panel.get_master_params());
          //~ this.getStore().load(); 
      //~ }
    };
    //  HKC
    //Lino.do_when_visible(this,todo.createDelegate(this));
      Lino.do_when_visible(this,todo.bind(this));
  },
  load_record_id : function(record_id,after) {
      Lino.run_detail_handler(this,record_id)
  }
  
});
  
Ext.define('Lino.selection.CellModel', {
    override : 'Ext.selection.CellModel',

    onSelectChange: function(record, isSelected, suppressEvent, commitFn) {
        var me = this,
            pos, eventName, view;

        if (isSelected) {
            pos = me.nextSelection;
            eventName = 'select';
        } else {
            // Ticket #1962 Seems that there is some half-finished deselection when opening a detail view. Causing this.selection to be nul, and thus has no pos.
            // I tested and it seems that this.view === pos.view when extjs is working correctly. This might have be changed on other selection models. if errors arise.
            // It seems that the events later in this function are fired, with pos.row
            pos = me.selection === null ? {view : this.view} : me.selection;
            eventName = 'deselect';

        }

        // CellModel may be shared between two sides of a Lockable.
        // The position must include a reference to the view in which the selection is current.
        // Ensure we use the view specified by the position.



        view = pos.view || me.primaryView;

        if ((suppressEvent || me.fireEvent('before' + eventName, me, record, pos.rowIdx, pos.colIdx)) !== false &&
                commitFn() !== false) {

            if (isSelected) {
                view.onCellSelect(pos);
            } else {
                view.onCellDeselect(pos);
                delete me.selection;
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record, pos.rowIdx, pos.colIdx);
            }
        }
    },
    })
//~ Lino.MainPanelMixin = {
  //~ tbar_items : function() {
      //~ return ;
  //~ }
//~ };

//~ Ext.override(Lino.GridPanel,Lino.MainPanelMixin);
//~ Ext.override(Lino.FormPanel,Lino.MainPanelMixin);

//~ Lino.grid_context_menu = function(e) {
  //~ console.log('contextmenu',arguments);
//~ }

Lino.row_context_menu = function(grid,row,col,e) {
  console.log('20130927 rowcontextmenu',grid,row,col,e,grid.store.getProxy().getReader().rawData.rows[row]);
    grid = this;
//    e.stopEvent();
  //  todo loop disabled fields for each selected rows' DA,
//  todo render c-menu
if(!grid.cmenu.el){
      //grid.cmenu.el.render();
      grid.cmenu.render();
      //grid.cmenu.showAt(e.getXY());
  }

}

//Lino.cell_context_menu = function(_this, _grid,row,col,_e,a, e) {
Lino.cell_context_menu = function(view, td, cellIndex, record, tr, rowIndex, e, eOpts){
  //~ console.log('20120531 cellcontextmenu',grid,row,col,e,grid.store.reader.arrayData.rows[row]);
  //  HKC
  //  e.stopPropagation();
    grid = this;
    e.stopEvent();
    //e.cancelBubble = true;
  //~ grid.getView().focusCell(row,col);
  //  HKC
  //grid.getSelectionModel().select(row,col);
//  grid.getSelectionModel().select({
//                row: rowIndex,
//                column: cellIndex
//            });
    //this.getSelectionModel().select(row,col);
  //~ console.log(grid.store.getAt(row));
  //~ grid.getView().focusRow(row);
  //~ return;
  //  HKC
  if(!grid.cmenu.el){
      //grid.cmenu.el.render();
      grid.cmenu.render();
      //grid.cmenu.showAt(e.getXY());
  }
  //~ if(e.record.data.disabled_fields) {
  
//  var da = this.store.getProxy().getReader().rawData.rows[rowIndex][grid.disabled_actions_index];
// seems that the proxy reader data can sometimes only include the last 10 records collected by infinite scroll
  var rows = grid.getSelectionModel().getSelected();
  this.cmenu.cascade(function(item){
                // Enable all cmenu items, then disable them if any row has the action disabled.
                item.enable();
              });
  rows.items.forEach(function(row){
          var da = row.data.disabled_fields
          if (da){
              grid.cmenu.cascade(function(item){
                //~ console.log(20120531, item.itemId, da[item.itemId]);
                if (da[item.itemId]) item.disable();
              });
          }
      });
  
  var xy = e.getXY();
  //xy[1] -= grid.cmenu.el.getHeight();
  grid.cmenu.showAt(xy);
};


// Lino.chooser_handler = function(combo,name) {
//   return function(cmp, newValue, oldValue) {
//     //~ console.log('Lino.chooser_handler()',cmp,oldValue,newValue);
//     combo.setContextValue(name, newValue);
//   }
// };


// Edited by HKC
//Lino.ComboBox = Ext.extend(Ext.form.ComboBox,{
Ext.define('Lino.ComboBox', {
    extend : 'Ext.form.ComboBox',
  forceSelection: "yes but select on tab",
  // forceSelection: true,
  triggerAction: 'all',
  minListWidth:280, // 20131022
//  width:235,

  autoSelect: false,
  selectOnFocus: false, // select any existing text in the field immediately on focus.
  submitValue: true,
  displayField: '{{constants.CHOICES_TEXT_FIELD}}', // 'text', 
  valueField: '{{constants.CHOICES_VALUE_FIELD}}', // 'value',
  changed : false,
  queryMode : 'remote',
  hiddenvalue_tosubmit: "",
  hiddenvalue_id: null,
    
});

Ext.define('Lino.ChoicesFieldElement',{
    extend : 'Lino.ComboBox',
    mode: 'local',
    findRecordByValue: function(value) {
        var result = this.store.byText.get(value),
            ret = false;
        // If there are duplicate keys, tested behaviour is to return the *first* match.
        if (result) {
            ret = result[0] || result;
        }
        return ret;
    },
});
Ext.define('Lino.SimpleRemoteComboStore',{
  extend:'Ext.data.JsonStore',
//Lino.SimpleRemoteComboStore = Ext.extend(Ext.data.JsonStore,{
  // forceSelection: true,  20140206 why was this here?
  constructor: function(config){
      Lino.SimpleRemoteComboStore.superclass.constructor.call(this, Ext.apply(config, {
          totalProperty: 'count',
          root: 'rows',
          id: '{{constants.CHOICES_VALUE_FIELD}}', // 'value'
          fields: ['{{constants.CHOICES_VALUE_FIELD}}' ],
          listeners: { exception: Lino.on_store_exception }
      }));
      //this.callSuper(Ext.apply(config, {
      //    totalProperty: 'count',
      //    root: 'rows',
      //    id: '{{constants.CHOICES_VALUE_FIELD}}', // 'value'
      //    fields: ['{{constants.CHOICES_VALUE_FIELD}}' ],
      //    listeners: { exception: Lino.on_store_exception }
      //}));
  }
});

Ext.define('Lino.ComplexRemoteComboStore',{
  extend:'Ext.data.JsonStore',
//Lino.ComplexRemoteComboStore = Ext.extend(Ext.data.JsonStore,{
  constructor: function(config){
      Lino.ComplexRemoteComboStore.superclass.constructor.call(this, Ext.apply(config, {
          totalProperty: 'count',
          root: 'rows',
          id: 'value', // constants.CHOICES_VALUE_FIELD
          fields: ['value','text'], // constants.CHOICES_VALUE_FIELD, // constants.CHOICES_TEXT_FIELD
          listeners: { exception: Lino.on_store_exception }
      }));
      //this.callSuper(Ext.apply(config, {
      //    totalProperty: 'count',
      //    root: 'rows',
      //    id: 'value', // constants.CHOICES_VALUE_FIELD
      //    fields: ['value','text'], // constants.CHOICES_VALUE_FIELD, // constants.CHOICES_TEXT_FIELD
      //    listeners: { exception: Lino.on_store_exception }
      //}));
  }
});

Ext.define('Lino.RemoteComboFieldElement',{
  extend:'Lino.ComboBox',
  mode: 'remote',
  queryMode : 'remote',
  width:235,
  //~ forceSelection:false,
  minChars: 2, // default 4 is too much
  queryDelay: 300, // default 500 is maybe slow
  queryParam: '{{constants.URL_PARAM_FILTER}}', 
  //~ typeAhead: true,
  //~ selectOnFocus: true, // select any existing text in the field immediately on focus.
  resizable: false
});

/*
Thanks to Animal for posting the basic idea:
http://www.sencha.com/forum/showthread.php?15842-2.0-SOLVED-Combobox-twintrigger-clear&p=76130&viewfull=1#post76130

*/

Ext.define('Lino.TwinCombo',{
  extend:'Lino.RemoteComboFieldElement',
    forceSelection : false,
    trigger2Class : 'x-form-search-trigger',
    triggers: {
        search: {
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: 'onTrigger2Click',
            scope: 'this'
        }
    }
  });
Lino.TwinCombo.prototype.getTrigger = Ext.form.field.Text.prototype.getTrigger;
Lino.TwinCombo.prototype.getOuterSize = Ext.form.field.Text.prototype.getOuterSize;
Lino.TwinCombo.prototype.initTrigger = Ext.form.field.Text.prototype.initTrigger;
Lino.TwinCombo.prototype.onTrigger1Click = Ext.form.ComboBox.prototype.onTriggerClick;


Ext.define('Lino.SimpleRemoteComboFieldElement',{
    extend : 'Lino.RemoteComboFieldElement',
  displayField: 'value',
  valueField: undefined,
  forceSelection: false
  // ,isDirty : function () {
  //       var me = this;
  //       if (me.originalValue == "") {me.originalValue = null;}
  //       return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
  //   }
});


Ext.define('Lino.Window', {
    extend: 'Ext.Window',
    mixins: ['Ext.Component'],
  closeAction : 'hide',
  renderTo: 'main_area',
  constrain: true,
  maximized: true,
  draggable: false,
  width: 700,
  height: 500,
//  listeners:
//        {
//        show: function()
//        {
////            this.removeCls("x-unselectable");
//        }
//        }  ,
  constructor : function (config) {

    if (!config.keyMap){config.keyMap = {}}  //init keymap as {} to allow for inheritance
    if (config.main_item.params_panel) {
        config.layout = 'border';
        config.main_item.region = 'center';
        config.main_item.params_panel.region = 'north';
        //~ config.main_item.params_panel.autoHeight = false; // 20130924
        config.main_item.params_panel.hidden = config.main_item.params_panel_hidden;
        config.items = [config.main_item.params_panel, config.main_item];
        //~ 20130923b
    } else {
        config.layout = 'fit';
        config.items = config.main_item;
    }
    this.main_item = config.main_item;

    if (typeof config.width == "string" && config.width.slice(-1) == "%") {
        config.width = Lino.perc2width(parseInt(config.width.slice(0, -1)));
    }

    delete config.main_item;
    //~ delete config.params_item;
    
    //~ this.main_item = config.items.get(0);
    this.main_item.containing_window = this;
    
    //~ console.log('20120110 Lino.Window.constructor() 1');
    //~ if (Lino.current_window) { // all windows except the top are closable
    if (this.main_item.hide_window_title) {
      config.closable = false;
      config.frame = false;
      config.shadow = false;
      //~ config.border = true;
      //~ config.title = undefined;
      //~ config.tools = null;
      delete config.title;
      delete config.tools;
    } else {
      config.title = this.main_item.empty_title;
      config.closable = true;
      config.tools = [ 
        { qtip: 'permalink', handler: Lino.permalink_handler(this), type: "pin" }
      ];
      if (this.main_item.content_type && this.main_item.action_name != 'insert') {
        config.tools = [ {
          handler: Lino.help_text_editor,
          qtip: "{{_('Edit help texts for fields on this model.')}}",
          scope: this.main_item,
          type: "gear"
        }].concat(config.tools);
      }
        
    //~ { qtip: '', handler: Lino.save_wc_handler(this), id: "save" }, 
    //~ { qtip: this.config.qtip, handler: Lino.save_wc_handler(this), id: "save" }, 
    //~ { qtip: 'Call doLayout() on main Container.', handler: Lino.refresh_handler(this), id: "refresh" },
    //~ if (this.main_item.params_panel) {
        //~ config.tools = config.tools.concat([
          //~ { qtip: 'Show/hide parameter panel', handler: this.toggle_params_panel, id: "gear", scope:this } 
        //~ ]);
    //~ }
    //~ if (config.closable !== false) {
      // if undefined, will take default behaviour
      //~ config.tools = config.tools.concat([ 
        //~ { qtip: 'close', handler: this.hide, id: "close", scope:this } 
      //~ ]);
    }
    
    this.main_item.config_containing_window(this.main_item, config);
    
    // console.log('20150514 Lino.Window.constructor() 2');
    Lino.Window.superclass.constructor.call(this,config);
    //  this.callSuper(config);

    
    // console.log('20120110 Lino.Window.constructor() 3');
    
  },
  initComponent : function() {
    this.main_item.init_containing_window(this);
    Lino.Window.superclass.initComponent.call(this);
    // this.callParent();  // 20160630
    // this.callSuper(arguments);
  
  },
  hide : function() { 
      this.main_item.do_when_clean(false,function() { 
        Lino.close_window(); });
  },
  hide_really : function() { 
    Lino.Window.superclass.hide.call(this);
    //this.callSuper(arguments);
  },
  onRender : function(ct, position){
    // console.log('20140829 Lino.Window.onRender() 1');
    // Lino.Window.superclass.onRender.call(this, ct, position);
    this.callSuper(arguments);
    var main_area = Ext.getCmp('main_area');
    // var main_area = Ext.getBody();
    //~ console.log('20120110 Lino.Window.onRender() 2');
  
    this.on('show', function(win) {
        // console.log('20140829 Lino.Window.on(show) : add resize handler');
        main_area.on('resize', win.onWindowResize, win);
        this.removeCls("x-unselectable");
        // Focus quick-search on first opening, (does not fire when refocusing, but does on reopening)
        if (this.main_item.quick_search_field != undefined) this.main_item.quick_search_field.focus();
    });
    this.on('hide', function(win) {
        // console.log('20140829 Lino.Window.on(hide) : remove resize handler');
        main_area.un('resize', win.onWindowResize, win);
    });
    // console.log('20140829 Lino.Window.onRender() 3');
  }
});



function initializeFooBarDropZone(cmp) {
    //~ console.log('initializeFooBarDropZone',cmp);
    cmp.dropTarget = new Ext.dd.DropTarget(cmp.bwrap, {
      //~ ddGroup     : 'gridDDGroup',
      notifyEnter : function(ddSource, e, data) {
        console.log('notifyEnter',ddSource,e,data);
        //Add some flare to invite drop.
        cmp.body.stopFx();
        cmp.body.highlight();
      },
      notifyDrop  : function(ddSource, e, data){
        console.log('notifyDrop',ddSource,e,data);
        // Reference the record (single selection) for readability
        //~ var selectedRecord = ddSource.dragData.selections[0];


        // Load the record into the form
        //~ formPanel.getForm().my_loadRecord(selectedRecord);


        // Delete record from the grid.  not really required.
        //~ ddSource.grid.store.remove(selectedRecord);

        return(true);
      }
    })
}

{% if settings.SITE.use_awesome_uploader %}
//Edited by HKC Ext.window -> Ext.window.Window
//Lino.AwesomeUploaderWindow = new Ext.Window({
Lino.AwesomeUploaderWindow = Ext.create('Ext.window.Window',{
		title:'Awesome Uploader in a Window!'
		,closeAction:'hide'
		,frame:true
		,width:500
		,height:200
		,items:{
			xtype:'awesomeuploader'
			,gridHeight:100
			,height:160
			,awesomeUploaderRoot:MEDIA_URL+'/lino/AwesomeUploader/'
			,listeners:{
				scope:this
				,fileupload:function(uploader, success, result){
					if(success){
						Ext.Msg.alert('File Uploaded!','A file has been uploaded!');
					}
				}
			}
		}
});
Lino.show_uploader = function () {
  Lino.AwesomeUploaderWindow.show();
};
{% endif %}

Lino.show_mti_child = function(fieldname,detail_handler) {
  //~ console.log('show_mti_child',this);
  //~ console.log('show_mti_child',panel.find("main_area"));
  rec = Lino.current_window.main_item.get_current_record();
  //~ rec = panel.get_current_record();
  if (rec) {
    //~ console.log('show_mti_child',Lino.current_window,rec);
    if (rec.phantom) {
      Lino.notify('Not allowed on phantom record.');
    }else if (rec.data[fieldname]) {
      //~ console.log('show_mti_child',rec.id);
      //~ detail_handler(Lino.current_window.main_item,{},{record_id:rec.id});
      detail_handler.run(null,{record_id:rec.id});
      //~ window.open(urlroot + '/' + rec.id);
      //~ document.location = urlroot + '/' + rec.id;
      //~ window.open(urlroot + '/' + rec.id,'_blank');
    } else {
      Lino.alert("{{_('Cannot show MTI child if checkbox is off.')}}");
    }
  } else {
    Lino.notify('No current record.');
  }
};


/*
captureEvents utility by Aaron Conran
<http://www.sencha.com/learn/grid-faq/>

Ext.onReady(function(){
    var grid = new Ext.grid.GridPanel({
        ... 
    });
    captureEvents(grid);
});
*/
function captureEvents(observable) {
    Ext.util.Observable.capture(
        observable,
        function(eventName) {
            console.info(eventName);
        },
        this
    );		
}

// settings.SITE.get_plugin_snippets()

{% if settings.SITE.use_esteid %}

Lino.init_esteid = function() {

  try {
    //~ var esteid = document.getElementById("esteid");
    var esteid = Ext.get("esteid");
    console.log("20121214 esteid is ",esteid)
  } catch(err) {
    console.log("20121214 Error:",err.message);
  }
  
  function cardInserted(reader) {
    var names = [ "firstName", "lastName", "middleName", "sex",
                  "citizenship", "birthDate", "personalID", "documentID",
                  "expiryDate", "placeOfBirth", "issuedDate", "residencePermit",
                  "comment1", "comment2", "comment3", "comment4"
    ];
    var pdata = esteid["personalData"];
    console.log("20121214, personalData is ",pdata)
  }
  
  try {
    console.log(20121214,esteid.getVersion());
    addEvent(esteid, "CardInserted", cardInserted);
    //~ addEvent(Lino.esteid, "CardRemoved", Lino.cardRemoved);
    //~ addEvent(esteid, "SignSuccess", signSuccess);
    //~ addEvent(esteid, "SignFailure", signFailure);
  } catch(err) {
    console.log("20121214 Error:",err.message);
  }
  
}

{% endif %}

Lino.copyToClipboard = function (test) {
    // Using idea form http://stackoverflow.com/a/34050374
    document.getElementById("body").innerHTML =
   '<textarea id="mytmpcontent" cols="0" rows="0">'+ test +'</textarea>';
    var mytmpcontent = document.getElementById("mytmpcontent");
    mytmpcontent.select();
    document.execCommand('copy');
    document.getElementById("body").removeChild(mytmpcontent);
};
