# -*- coding: UTF-8 -*-
# Copyright 2009-2017 Rumma & Ko Ltd
# License: GNU Affero General Public License v3 (see file COPYING for details)

"""

Summary from <http://en.wikipedia.org/wiki/Restful>:

    On an element:

    - GET : Retrieve a representation of the addressed member of the collection expressed in an appropriate MIME type.
    - PUT : Update the addressed member of the collection or create it with the specified ID.
    - POST : Treats the addressed member as a collection and creates a new subordinate of it.
    - DELETE : Delete the addressed member of the collection.

    On a list:

    - GET : List the members of the collection.
    - PUT : Replace the entire collection with another collection.
    - POST : Create a new entry in the collection where the ID is assigned automatically by the collection.
      The ID created is included as part of the data returned by this operation.
    - DELETE : Delete the entire collection.




"""
from __future__ import unicode_literals

import ast

import logging
logger = logging.getLogger(__name__)

from django import http
from django.db import models
from django.conf import settings
from django.views.generic import View
import json
from django.utils.translation import gettext as _
from django.utils.encoding import force_str

from lino.core.signals import pre_ui_delete
from lino.core.utils import obj2unicode
from lino.core import actions
from lino.core.fields import choices_for_field

from etgen import html as xghtml

E = xghtml.E

from lino.utils import ucsv
from lino.utils import isiterable
from lino.utils import dblogger


from lino.core.views import requested_actor, action_request
from lino.core.views import json_response, json_response_kw
from lino.core.views import choices_response

from lino.core import constants
from lino.core.requests import BaseRequest

from lino.modlib.extjs.views import RunJasmine, EidAppletService, elem2rec_empty


MAX_ROW_COUNT = 300


class HttpResponseDeleted(http.HttpResponse):
    status_code = 204


def delete_element(ar, elem):
    if elem is None:
        raise Warning("Cannot delete None")
    msg = ar.actor.disable_delete(elem, ar)
    if msg is not None:
        ar.error(None, msg, alert=True)
        return ar.renderer.render_action_response(ar)

    # ~ dblogger.log_deleted(ar.request,elem)

    # ~ changes.log_delete(ar.request,elem)

    pre_ui_delete.send(sender=elem, request=ar.request)

    try:
        elem.delete()
    except Exception as e:
        dblogger.exception(e)
        msg = _("Failed to delete %(record)s : %(error)s."
                ) % dict(record=obj2unicode(elem), error=e)
        # ~ msg = "Failed to delete %s." % element_name(elem)
        ar.error(None, msg)
        return ar.renderer.render_action_response(ar)
        # ~ raise Http404(msg)

    return HttpResponseDeleted()


class AdminIndex(View):
    """
    Similar to PlainIndex
    """

    def get(self, request, *args, **kw):
        # logger.info("20150427 AdminIndex.get()")
        # settings.SITE.startup()
        renderer = settings.SITE.plugins.extjs.renderer
        # if settings.SITE.user_model is not None:
        #     user = request.subst_user or request.user
        #     a = settings.SITE.get_main_action(user)
        #     if a is not None and a.get_view_permission(user.user_type):
        #         kw.update(on_ready=renderer.action_call(request, a, {}))
        return http.HttpResponse(renderer.html_page(request, **kw))


class MainHtml(View):
    def get(self, request, *args, **kw):
        # ~ logger.info("20130719 MainHtml")
        settings.SITE.startup()
        # ~ raise Exception("20131023")
        ar = BaseRequest(request,
            renderer=settings.SITE.kernel.default_renderer)
        ar.success(html=settings.SITE.get_main_html(ar))
        return ar.renderer.render_action_response(ar)






class ActionParamChoices(View):
    # Examples: `welfare.pcsw.CreateCoachingVisit`
    def get(self, request, app_label=None, actor=None, an=None, field=None, **kw):
        actor = requested_actor(app_label, actor)
        ba = actor.get_url_action(an)
        if ba is None:
            raise Exception("Unknown action %r for %s" % (an, actor))
        field = ba.action.get_param_elem(field)
        qs, row2dict = choices_for_field(request, ba.request(request=request), field)
        if field.blank:
            emptyValue = ''
        else:
            emptyValue = None
        return choices_response(actor, request, qs, row2dict, emptyValue)


class Choices(View):
    # ~ def choices_view(self,request,app_label=None,rptname=None,fldname=None,**kw):
    def get(self, request, app_label=None, rptname=None, fldname=None, **kw):
        """
        Return a JSON object with two attributes `count` and `rows`,
        where `rows` is a list of `(display_text,value)` tuples.
        Used by ComboBoxes or similar widgets.
        If `fldname` is not specified, returns the choices for
        the `record_selector` widget.
        """
        rpt = requested_actor(app_label, rptname)
        emptyValue = None
        if fldname is None:
            ar = rpt.request(request=request)  # ,rpt.default_action)
            # ~ rh = rpt.get_handle(self)
            # ~ ar = ViewReportRequest(request,rh,rpt.default_action)
            # ~ ar = dbtables.TableRequest(self,rpt,request,rpt.default_action)
            # ~ rh = ar.ah
            # ~ qs = ar.get_data_iterator()
            qs = ar.data_iterator

            # ~ qs = rpt.request(self).get_queryset()

            def row2dict(obj, d):
                d[constants.CHOICES_TEXT_FIELD] = str(obj)
                # getattr(obj,'pk')
                d[constants.CHOICES_VALUE_FIELD] = obj.pk
                return d
        else:
            """
            NOTE: if you define a *parameter* with the same name
            as some existing *data element* name, then the parameter
            will override the data element. At least here in choices view.
            """
            # ~ field = find_field(rpt.model,fldname)
            field = rpt.get_param_elem(fldname)
            if field is None:
                field = rpt.get_data_elem(fldname)
            if field.blank:
                # ~ logger.info("views.Choices: %r is blank",field)
                emptyValue = ''
            qs, row2dict = choices_for_field(rpt.request(request=request), rpt, field)

        return choices_response(rpt, request, qs, row2dict, emptyValue)


class Restful(View):
    """
    Used to collaborate with a restful Ext.data.Store.
    """

    def post(self, request, app_label=None, actor=None, pk=None):
        rpt = requested_actor(app_label, actor)
        ar = rpt.request(request=request)

        instance = ar.create_instance()
        # store uploaded files.
        # html forms cannot send files with PUT or GET, only with POST
        if ar.actor.handle_uploaded_files is not None:
            ar.actor.handle_uploaded_files(instance, request)

        data = request.POST.get('rows')
        data = json.loads(data)
        ar.form2obj_and_save(data, instance, True)

        # Ext.ensible needs list_fields, not detail_fields
        ar.set_response(
            rows=[ar.ah.store.row2dict(
                ar, instance, ar.ah.store.list_fields)])
        return json_response(ar.response)

    def delete(self, request, app_label=None, actor=None, pk=None):
        rpt = requested_actor(app_label, actor)
        ar = rpt.request(request=request)
        ar.set_selected_pks(pk)
        return delete_element(ar, ar.selected_rows[0])

    def get(self, request, app_label=None, actor=None, pk=None):
        rpt = requested_actor(app_label, actor)
        assert pk is None, 20120814
        ar = rpt.request(request=request)
        rh = ar.ah
        rows = [
            rh.store.row2dict(ar, row, rh.store.list_fields)
            for row in ar.sliced_data_iterator]
        kw = dict(count=ar.get_total_count(), rows=rows)
        kw.update(title=str(ar.get_title()))
        return json_response(kw)

    def put(self, request, app_label=None, actor=None, pk=None):
        rpt = requested_actor(app_label, actor)
        ar = rpt.request(request=request)
        ar.set_selected_pks(pk)
        elem = ar.selected_rows[0]
        rh = ar.ah

        data = http.QueryDict(request.body).get('rows')
        data = json.loads(data)
        a = rpt.get_url_action(rpt.default_list_action_name)
        ar = rpt.request(request=request, action=a)
        ar.renderer = settings.SITE.kernel.extjs_renderer
        ar.form2obj_and_save(data, elem, False)
        # Ext.ensible needs list_fields, not detail_fields
        ar.set_response(
            rows=[rh.store.row2dict(ar, elem, rh.store.list_fields)])
        return json_response(ar.response)


NOT_FOUND = "%s has no row with primary key %r"


class ApiElement(View):
    def get(self, request, app_label=None, actor=None, pk=None):
        ui = settings.SITE.kernel
        rpt = requested_actor(app_label, actor)

        action_name = request.GET.get(constants.URL_PARAM_ACTION_NAME, None)
        if action_name:
            ba = rpt.get_url_action(action_name)
            if ba is None:
                raise http.Http404("%s has no action %r" % (rpt, action_name))
        else:
            ba = rpt.detail_action

        if pk and pk != '-99999' and pk != '-99998':
            # ~ ar = ba.request(request=request,selected_pks=[pk])
            # ~ print 20131004, ba.actor
            # Use url selected rows as selected PKs if defined, otherwise use the PK defined in the url path
            sr = request.GET.getlist(constants.URL_PARAM_SELECTED)
            if not sr:
                sr = [pk]
            ar = ba.request(request=request, selected_pks=sr)
            elem = ar.selected_rows[0]
        else:
            ar = ba.request(request=request)
            elem = None

        ar.renderer = ui.extjs_renderer
        ah = ar.ah

        fmt = request.GET.get(
            constants.URL_PARAM_FORMAT, ba.action.default_format)

        if ba.action.opens_a_window:

            if fmt == constants.URL_FORMAT_JSON:
                if pk == '-99999':
                    elem = ar.create_instance()
                    datarec = ar.elem2rec_insert(ah, elem)
                elif pk == '-99998':
                    elem = ar.create_instance()
                    datarec = elem2rec_empty(ar, ah, elem)
                elif elem is None:
                    datarec = dict(
                        success=False, message=NOT_FOUND % (rpt, pk))
                else:
                    datarec = ar.elem2rec_detailed(elem)
                return json_response(datarec)

            after_show = ar.get_status(record_id=pk)
            tab = request.GET.get(constants.URL_PARAM_TAB, None)
            if tab is not None:
                tab = int(tab)
                after_show.update(active_tab=tab)

            return http.HttpResponse(
                ui.extjs_renderer.html_page(
                    request, ba.action.label,
                    on_ready=ui.extjs_renderer.action_call(
                        request, ba, after_show)))

        # if isinstance(ba.action, actions.RedirectAction):
        #     target = ba.action.get_target_url(elem)
        #     if target is None:
        #         raise http.Http404("%s failed for %r" % (ba, elem))
        #     return http.HttpResponseRedirect(target)

        if pk == '-99998':
            assert elem is None
            elem = ar.create_instance()
            ar.selected_rows = [elem]
        elif elem is None:
            raise http.Http404(NOT_FOUND % (rpt, pk))
        return settings.SITE.kernel.run_action(ar)

    def post(self, request, app_label=None, actor=None, pk=None):
        ar = action_request(
            app_label, actor, request, request.POST, True,
            renderer=settings.SITE.kernel.extjs_renderer)
        if pk == '-99998':
            elem = ar.create_instance()
            ar.selected_rows = [elem]
        else:
            ar.set_selected_pks(pk)
        return settings.SITE.kernel.run_action(ar)

    def put(self, request, app_label=None, actor=None, pk=None):
        data = http.QueryDict(request.body)  # raw_post_data before Django 1.4
        # logger.info("20150130 %s", data)
        ar = action_request(
            app_label, actor, request, data, False,
            renderer=settings.SITE.kernel.extjs_renderer)
        ar.set_selected_pks(pk)
        return settings.SITE.kernel.run_action(ar)

    def delete(self, request, app_label=None, actor=None, pk=None):
        data = http.QueryDict(request.body)
        ar = action_request(
            app_label, actor, request, data, False,
            renderer=settings.SITE.kernel.extjs_renderer)
        ar.set_selected_pks(pk)
        return settings.SITE.kernel.run_action(ar)

    def old_delete(self, request, app_label=None, actor=None, pk=None):
        rpt = requested_actor(app_label, actor)
        ar = rpt.request(request=request)
        ar.set_selected_pks(pk)
        elem = ar.selected_rows[0]
        return delete_element(ar, elem)


class ApiList(View):
    def post(self, request, app_label=None, actor=None):
        ar = action_request(app_label, actor, request, request.POST, True)
        ar.renderer = settings.SITE.kernel.extjs_renderer
        return settings.SITE.kernel.run_action(ar)

    def get(self, request, app_label=None, actor=None):
        ar = action_request(app_label, actor, request, request.GET, True)
        # Add this hack to support the 'sort' param which is different in Extjs6.
        if ar.order_by and ar.order_by[0]:
            _sort = ast.literal_eval(ar.order_by[0])
            sort = _sort[0]['property']
            if _sort[0]['direction'] and _sort[0]['direction'] == 'DESC':
                sort = '-' + sort
            ar.order_by = [str(sort)]
        ar.renderer = settings.SITE.kernel.extjs_renderer
        rh = ar.ah

        fmt = request.GET.get(
            constants.URL_PARAM_FORMAT,
            ar.bound_action.action.default_format)

        if fmt == constants.URL_FORMAT_JSON:
            rows = [rh.store.row2list(ar, row)
                    for row in ar.sliced_data_iterator]
            total_count = ar.get_total_count()
            for row in ar.create_phantom_rows():
                if ar.limit is None or len(rows) + 1 < ar.limit or ar.limit == total_count + 1:
                    d = rh.store.row2list(ar, row)
                    rows.append(d)
                total_count += 1
            # assert len(rows) <= ar.limit
            kw = dict(count=total_count,
                      rows=rows,
                      success=True,
                      no_data_text=ar.no_data_text,
                      title=str(ar.get_title()))
            if ar.actor.parameters:
                kw.update(
                    param_values=ar.actor.params_layout.params_store.pv2dict(
                        ar, ar.param_values))
            return json_response(kw)

        if fmt == constants.URL_FORMAT_HTML:
            after_show = ar.get_status()

            sp = request.GET.get(
                constants.URL_PARAM_SHOW_PARAMS_PANEL, None)
            if sp is not None:
                # ~ after_show.update(show_params_panel=sp)
                after_show.update(
                    show_params_panel=constants.parse_boolean(sp))

            # if isinstance(ar.bound_action.action, actions.ShowInsert):
            #     elem = ar.create_instance()
            #     rec = ar.elem2rec_insert(rh, elem)
            #     after_show.update(data_record=rec)

            kw = dict(on_ready=
            ar.renderer.action_call(
                ar.request,
                ar.bound_action, after_show))
            # ~ print '20110714 on_ready', params
            kw.update(title=ar.get_title())
            return http.HttpResponse(ar.renderer.html_page(request, **kw))

        if fmt == 'csv':
            # ~ response = HttpResponse(mimetype='text/csv')
            charset = settings.SITE.csv_params.get('encoding', 'utf-8')
            response = http.HttpResponse(
                content_type='text/csv;charset="%s"' % charset)
            if False:
                response['Content-Disposition'] = \
                    'attachment; filename="%s.csv"' % ar.actor
            else:
                # ~ response = HttpResponse(content_type='application/csv')
                response['Content-Disposition'] = \
                    'inline; filename="%s.csv"' % ar.actor

            # ~ response['Content-Disposition'] = 'attachment; filename=%s.csv' % ar.get_base_filename()
            w = ucsv.UnicodeWriter(response, **settings.SITE.csv_params)
            w.writerow(ar.ah.store.column_names())
            if True:  # 20130418 : also column headers, not only internal names
                column_names = None
                fields, headers, cellwidths = ar.get_field_info(column_names)
                w.writerow(headers)

            for row in ar.data_iterator:
                w.writerow([str(v) for v in rh.store.row2list(ar, row)])
            return response

        if fmt == constants.URL_FORMAT_PRINTER:
            if ar.get_total_count() > MAX_ROW_COUNT:
                raise Exception(_("List contains more than %d rows") %
                                MAX_ROW_COUNT)
            response = http.HttpResponse(
                content_type='text/html;charset="utf-8"')
            doc = xghtml.Document(force_str(ar.get_title()))
            doc.body.append(E.h1(doc.title))
            t = doc.add_table()
            # ~ settings.SITE.kernel.ar2html(ar,t,ar.data_iterator)
            ar.dump2html(t, ar.data_iterator, header_links=False)
            doc.write(response, encoding='utf-8')
            return response

        return settings.SITE.kernel.run_action(ar)
