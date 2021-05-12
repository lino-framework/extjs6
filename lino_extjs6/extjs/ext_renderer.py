# -*- coding: UTF-8 -*-
# Copyright 2009-2020 Rumma & Ko Ltd
# License: GNU Affero General Public License v3 (see file COPYING for details)

"""
Defines the :class:`ExtRenderer` class.
"""

import logging ; logger = logging.getLogger(__name__)

from django.conf import settings
from django.utils.translation import gettext as _

from lino.core.gfks import ContentType

import lino
from lino.core import constants
from lino.core.actions import ShowDetail, ShowInsert, ShowTable
from lino.core import dbtables
from lino.core import elems as ext_elems
from lino.utils import jsgen
from lino.utils.jsgen import py2js, js_code
from lino.modlib.users.utils import get_user_profile
from lino.modlib.extjs import ext_renderer



class ExtRenderer(ext_renderer.ExtRenderer):
    """
    Like ExtJS 3 renderer, but for ExtJS 6.
    """

    extjs_version = 6

    def js_render_ParamsPanelSubclass(self, dh):
        yield ""
        yield "Lino.%s = Ext.extend(Ext.form.FormPanel, {" % \
              dh.layout._formpanel_name
        for k, v in list(dh.main.ext_options().items()):
            # ~ if k != 'items':
            if not k in self.SUPPRESSED:
                yield "  %s: %s," % (k, py2js(v))
        # ~ yield "  collapsible: true,"
        # if dh.main.value.get('layout', False):
        if (type(dh.main.value['layout']) is str and dh.main.value['layout'] == 'hbox') or (
            type(dh.main.value['layout']) is dict and dh.main.value['layout'].get('type', False) == 'hbox'):
        # if dh.main.value['layout'] == 'hbox':
            yield "  layout: 'hbox',"
        else:
            yield "  layout: 'form',"
        yield "  autoHeight: true,"
        # ~ if dh.layout.window_size and dh.layout.window_size[1] == 'auto':
        # ~ yield "  autoHeight: true,"
        yield "  initComponent : function() {"
        # 20140503 yield "    var containing_panel = this;"
        lc = 0
        for ln in jsgen.declare_vars(dh.main.elements):
            yield "    " + ln
            lc += 1
        if lc == 0:
            # print 20150626, dh.main.elements[0].required_roles
            # print 20150626, jsgen._for_user_profile.__class__
            msg = "%r of %s has no variables" % (dh.main, dh)
            msg += ", datasource: %r, other datasources: %r" % (
                dh.layout._datasource, dh.layout._other_datasources)
            msg += ", main elements: %r" % dh.main.elements
            # raise Exception(msg)
            print((20150717, msg))
        yield "    this.items = %s;" % py2js(dh.main.elements)
        yield "    this.fields = %s;" % py2js(
            [e for e in dh.main.walk()
             if isinstance(e, ext_elems.FieldElement)])
        # yield "    Lino.%s.superclass.initComponent.call(this);" % \
        #     dh.layout._formpanel_name
        yield "this.callSuper();"
        yield "  }"
        yield "});"
        yield ""

    def js_render_ActionFormPanelSubclass(self, dh):
        tbl = dh.layout._datasource
        yield ""
        # yield "Lino.%s = Ext.extend(Lino.ActionFormPanel,{" % \
        #     dh.layout._formpanel_name
        yield "Ext.define('Lino.%s', { extend : 'Lino.ActionFormPanel'," % \
              dh.layout._formpanel_name
        for k, v in list(dh.main.ext_options().items()):
            if k != 'items':
                yield "  %s: %s," % (k, py2js(v))
        assert tbl.action_name is not None
        # ~ raise Exception("20121009 action_name of %r is None" % tbl)
        yield "  action_name: '%s'," % tbl.action_name
        yield "  ls_url: %s," % py2js(dh.layout._url)
        yield "  window_title: %s," % py2js(tbl.label)

        yield "  before_row_edit : function(record) {"
        for ln in self.before_row_edit(dh.main):
            yield "    " + ln
        yield "  },"

        # ~ yield "  layout: 'fit',"
        # ~ yield "  auto_save: true,"
        if dh.layout.window_size and dh.layout.window_size[1] == 'auto':
            yield "  autoHeight: true,"
        yield "  initComponent : function() {"
        # 20140503 yield "    var containing_panel = this;"
        lc = 0
        for ln in jsgen.declare_vars(dh.main.elements):
            yield "    " + ln
            lc += 1
        yield "    this.items = %s;" % py2js(dh.main.elements)
        yield "    this.fields = %s;" % py2js(
            [e for e in dh.main.walk()
             if isinstance(e, ext_elems.FieldElement)])
        # yield "    Lino.%s.superclass.initComponent.call(this);" % \
        #     dh.layout._formpanel_name

        yield "    this.http_method = %s" % py2js(tbl.http_method)
        yield "this.callSuper();";
        yield "  }"
        yield "});"
        yield ""

    def js_render_FormPanelSubclass(self, dh):

        tbl = dh.layout._datasource
        if not dh.main.get_view_permission(get_user_profile()):
            msg = "No view permission for main panel of %s :" % \
                  dh.layout._formpanel_name
            msg += " main requires %s (actor %s requires %s)" % (
                dh.main.required_roles,
                tbl, tbl.required_roles)
            # ~ raise Exception(msg)
            logger.warning(msg)
            print(20150717, msg)
            return

        yield ""
        # yield "Lino.%s = Ext.extend(Lino.FormPanel,{" % \
        #     dh.layout._formpanel_name
        yield "Ext.define('Lino.%s', { extend : 'Lino.FormPanel'," % \
              dh.layout._formpanel_name
        yield "  layout: 'fit',"
        yield "  auto_save: true,"
        if dh.layout.window_size and dh.layout.window_size[1] == 'auto':
            yield "  autoHeight: true,"
        if settings.SITE.is_installed('contenttypes') and issubclass(tbl, dbtables.Table):
            yield "  content_type: %s," % py2js(ContentType.objects.get_for_model(tbl.model).pk)
        if not tbl.editable:
            yield "  disable_editing: true,"
        if not tbl.auto_apply_params:
            yield "  auto_apply_params: false,"
        if dh.layout._formpanel_name.endswith('.InsertFormPanel'):
            yield "  default_record_id: -99999,"

        yield "  initComponent : function() {"
        # 20140503 yield "    var containing_panel = this;"
        # yield "// user user_type: %s" % jsgen._for_user_profile
        lc = 0
        for ln in jsgen.declare_vars(dh.main):
            yield "    " + ln
            lc += 1
        if lc == 0:
            raise Exception("%r of %s has no variables" % (dh.main, dh))
        yield "    this.items = %s;" % dh.main.as_ext()
        # ~ if issubclass(tbl,tables.AbstractTable):
        if True:
            yield "    this.before_row_edit = function(record) {"
            for ln in self.before_row_edit(dh.main):
                yield "      " + ln
            yield "    }"
        on_render = self.build_on_render(dh.main)
        if on_render:
            yield "    this.onRender = function(ct, position) {"
            for ln in on_render:
                yield "      " + ln
            yield "      Lino.%s.superclass.onRender.call(this, ct, position);" % \
                  dh.layout._formpanel_name
            # yield "      this.callSuper(ct, position);"
            yield "    }"

        # yield "    Lino.%s.superclass.initComponent.call(this);" % \
        #     dh.layout._formpanel_name
        yield "  this.callSuper();"

        # Add a change listener to active fields. This which will
        # cause automatic form submit when some actiove field is
        # changed.
        if dh.layout._formpanel_name.endswith('.DetailFormPanel'):
            if tbl.active_fields:
                yield '    // active_fields:'
                for name in tbl.active_fields:
                    e = dh.main.find_by_name(name)
                    if e is not None:  # 20120715
                        if True:  # see actions.ValidateForm
                            f = 'function(){ this.save() }'
                        else:
                            f = 'function(){ this.validate_form() }'
                        yield '    %s.on("change", %s, this);' % (
                            py2js(e), f)
        yield "  }"
        yield "});"
        yield ""

    def js_render_detail_action_FormPanel(self, rh, action):
        rpt = rh.actor
        # ~ logger.info('20121005 js_render_detail_action_FormPanel(%s,%s)',rpt,action.full_name(rpt))
        yield ""
        # ~ yield "// js_render_detail_action_FormPanel %s" % action
        dtl = action.get_window_layout()
        if dtl is None:
            raise Exception("action %s without detail?" % action.full_name())
        # yield "Lino.%sPanel = Ext.extend(Lino.%s,{" % (
        #     action.full_name(), dtl._formpanel_name)
        # Ext.define('Ext.window.Window', {
        # extend: 'Ext.panel.Panel',
        yield "Ext.define('Lino.%sPanel', { extend : 'Lino.%s'," % (
            action.full_name(), dtl._formpanel_name)
        yield "  empty_title: %s," % py2js(action.get_button_label())
        if rpt.hide_navigator:
            yield "  hide_navigator: true,"

        if rh.actor.params_panel_hidden:
            yield "  params_panel_hidden: true,"

        if action.action.save_action_name is not None:
            yield "  save_action_name: %s," % py2js(
                action.action.save_action_name)
        yield "  ls_bbar_actions: %s," % py2js(
            self.toolbar(rpt.get_toolbar_actions(action.action, get_user_profile())))
        yield "  ls_url: %s," % py2js(rpt.actor_url())
        if action.action != rpt.default_action.action:
            yield "  action_name: %s," % py2js(action.action.action_name)
        if isinstance(action.action, ShowInsert):
            yield "  default_record_id: -99999,"

        yield "  initComponent : function() {"
        a = rpt.detail_action
        if a:
            yield "    this.ls_detail_handler = Lino.%s;" % a.full_name()
        a = rpt.insert_action
        if a:
            yield "    this.ls_insert_handler = Lino.%s;" % a.full_name()

        # yield "    Lino.%sPanel.superclass.initComponent.call(this);" \
        #     % action.full_name()
        # this.callParent(arguments);
        # this.callSuper(arguments);
        yield "    this.callSuper();"
        yield "  }"
        yield "});"
        yield ""

    def js_render_GridPanel_class(self, rh):

        yield ""
        yield "// js_render_GridPanel_class %s" % rh.actor
        # yield "Lino.%s.GridPanel = Ext.extend(Lino.GridPanel,{" % rh.actor
        yield "Ext.define('Lino.%s.GridPanel', { extend : 'Lino.GridPanel'," % rh.actor

        kw = dict()
        # ~ kw.update(empty_title=%s,rh.actor.get_button_label()
        if getattr(rh.actor,'use_detail_params_value',None):
            kw.update(use_detail_params_value=True)
        kw.update(ls_url=rh.actor.actor_url())
        kw.update(ls_store_fields=[js_code(f.as_js(f.name))
                                   for f in rh.store.list_fields])
        if rh.store.pk is not None:
            kw.update(ls_id_property=rh.store.pk.name)
            kw.update(pk_index=rh.store.pk_index)
            if settings.SITE.is_installed('contenttypes'):
                m = getattr(rh.store.pk, 'model', None)
                # e.g. pk may be the VALUE_FIELD of a choicelist which
                # has no model
                if m is not None:
                    ct = ContentType.objects.get_for_model(m).pk
                    kw.update(content_type=ct)

        kw.update(cell_edit=rh.actor.cell_edit)
        kw.update(ls_bbar_actions=self.toolbar(
            rh.actor.get_toolbar_actions(rh.actor.default_action.action)))
        # kw.update(ls_grid_configs=[gc.data for gc in rh.actor.grid_configs])
        # kw.update(gc_name=constants.DEFAULT_GC_NAME)
        # ~ if action != rh.actor.default_action:
        # ~ kw.update(action_name=action.name)
        # ~ kw.update(content_type=rh.report.content_type)

        vc = dict(emptyText=_("No data to display."))
        if rh.actor.editable:
            vc.update(getRowClass=js_code('Lino.getRowClass'))
        if rh.actor.auto_fit_column_widths:
            kw.update(forceFit=True)
        if rh.actor.variable_row_height:
            vc.update(cellTpl=js_code("Lino.auto_height_cell_template"))
        if rh.actor.row_height != 1:
            kw.update(row_height=rh.actor.row_height)
            tpl = """new Ext.Template(
        '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
        '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" style="height:%dpx" {attr}>{value}</div>',
        '</td>')""" % (rh.actor.row_height * 11)
            vc.update(cellTpl=js_code(tpl))


        if rh.actor.drag_drop_sequenced_field is not None:
            vc.update(plugins={
            'ptype': 'gridviewdragdrop',
            'dragText': 'Drag and drop to reorganize',
            'sequenced_field' : rh.actor.drag_drop_sequenced_field})
        #todo get a field atrib also into the config somehow.
        kw.update(viewConfig=vc)

        if not rh.actor.editable:
            kw.update(disable_editing=True)

        if rh.actor.use_paging:
            kw.update(use_paging=True)

        if rh.actor.params_panel_hidden:
            kw.update(params_panel_hidden=True)

        kw.update(page_length=rh.actor.page_length)
        kw.update(stripeRows=True)

        # if rh.actor.label is not None:
        kw.update(title=rh.actor.label)
        if rh.actor.editable:
            kw.update(
                disabled_fields_index=rh.store.column_index('disabled_fields'))

        for k, v in kw.items():
            yield "  %s : %s," % (k, py2js(v))

        yield "  initComponent : function() {"

        a = rh.actor.detail_action
        if a:
            yield "    this.ls_detail_handler = Lino.%s;" % a.full_name()
        a = rh.actor.insert_action
        if a:
            yield "    this.ls_insert_handler = Lino.%s;" % a.full_name()

        yield "    var ww = this.containing_window;"
        for ln in jsgen.declare_vars(rh.list_layout.main.columns):
            yield "    " + ln

        yield "    this.before_row_edit = function(record) {"
        for ln in self.before_row_edit(rh.list_layout.main):
            yield "      " + ln
        yield "    };"

        on_render = self.build_on_render(rh.list_layout.main)
        if on_render:
            yield "    this.onRender = function(ct, position) {"
            for ln in on_render:
                yield "      " + ln
            yield "      Lino.%s.GridPanel.superclass.onRender.call(this, ct, position);" % rh.actor
            # yield "this.callSuper(ct, position);"
            yield "    }"

        yield "    this.ls_columns = %s;" % py2js([
                                                      ext_elems.GridColumn(rh.list_layout, i, e) for i, e
                                                      in enumerate(rh.list_layout.main.columns)])

        # yield "    Lino.%s.GridPanel.superclass.initComponent.call(this);" \
        #     % rh.actor
        yield "this.callSuper();"
        yield "  }"
        yield "});"
        yield ""

    def js_render_window_action(self, rh, ba):
        # x = str(rh)
        # if x.startswith('working'):
        #     print "20150421 {0}".format(x)
        # profile = get_user_profile()
        rpt = rh.actor

        if rpt.parameters and ba.action.use_param_panel:
            params_panel = rh.params_layout_handle
        else:
            params_panel = None

        if isinstance(ba.action, ShowDetail):
            mainPanelClass = "Lino.%sPanel" % ba.full_name()
        elif isinstance(ba.action, ShowInsert):
            mainPanelClass = "Lino.%sPanel" % ba.full_name()
        elif isinstance(ba.action, ShowTable):
            mainPanelClass = "Lino.%s.GridPanel" % rpt
        elif ba.action.parameters and not ba.action.no_params_window:
            params_panel = ba.action.make_params_layout_handle()
        elif ba.action.extjs_main_panel:
            pass
        else:
            # print "20150421 {0}".format(rh)
            return

        windowConfig = dict()
        wl = ba.get_window_layout()
        ws = ba.get_window_size()
        # ~ if wl is not None:
        # ~ ws = wl.window_size
        if True:
            if ws:
                windowConfig.update(
                    # ~ width=ws[0],
                    # width=js_code('Lino.chars2width(%d)' % ws[0]),
                    maximized=False,
                    draggable=True,
                    maximizable=True,
                    modal=True)
                # if isinstance(ws[0], basestring) and ws[0].endswith("%"):
                #     windowConfig.update(
                #         width=js_code('Lino.perc2width(%s)' % ws[0][:-1]))
                if isinstance(ws[0], str):
                    windowConfig.update(width=ws[0])
                else:
                    windowConfig.update(
                        width=js_code('Lino.chars2width(%d)' % ws[0]))
                if ws[1] == 'auto':
                    # windowConfig.update(autoHeight=True)
                    windowConfig.update(height=True)
                elif isinstance(ws[1], int):
                    # ~ windowConfig.update(height=ws[1])
                    windowConfig.update(
                        height=js_code('Lino.rows2height(%d)' % ws[1]))
                else:
                    raise ValueError("height")
                    # ~ print 20120629, action, windowConfig

        yield "Lino.%s = Ext.create('Lino.WindowAction',%s, function(){" % (
            ba.full_name(), py2js(windowConfig))
        # ~ yield "  console.log('20120625 fn');"
        if ba.action.extjs_main_panel:
            yield "  return %s;" % ba.action.extjs_main_panel
        else:
            p = dict()
            # if ba.action is settings.SITE.get_main_action(profile):
            #     p.update(is_home_page=True)
            if ba.actor.hide_top_toolbar or ba.action.parameters:
                p.update(hide_top_toolbar=True)
            if rpt.hide_window_title:
                p.update(hide_window_title=True)

            p.update(is_main_window=True)  # workaround for problem 20111206
            yield "  var p = %s;" % py2js(p)
            if params_panel:
                if ba.action.parameters:
                    yield "  return Ext.create('Lino.%s',{});" % wl._formpanel_name
                else:
                    yield "  p.params_panel = Ext.create('Lino.%s',{});" % params_panel.layout._formpanel_name
                    yield "  return Ext.create('%s',{p});" % mainPanelClass
            else:
                yield "  return Ext.create('%s',{p});" % mainPanelClass
        yield "});"
