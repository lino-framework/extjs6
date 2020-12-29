# -*- coding: UTF-8 -*-
# Copyright 2009-2020 Rumma & Ko Ltd
# License: BSD (see file COPYING for details)

"""The Lino user interface based on ExtJS 6.

When your Lino application uses the ExtJS user interface, then you may
need a `commercial license from Sencha
<https://www.sencha.com/store/extjs/>`__. Summary without warranty of
correctness: you need a commercial license if (1) your application is
not available under the GPL **and** (2) your site is used by other
people than the empoyees of the company who is the copyright holder of
your application.


.. autosummary::
   :toctree:

   views
   ext_renderer

"""

from django.utils.translation import ugettext_lazy as _
from lino.modlib.extjs import Plugin


class Plugin(Plugin):
    """Extends :class:`lino.core.plugin.Plugin`.

    This plugin automatically disables the :mod:`lino.modlib.tinymce`
    plugin.

    """

    disables_plugins = ['tinymce', 'extensible']
    """These two plugins don't work with ExtJS6 and therefore will
    automatically disabled if you set :attr:`default_ui` to
    :mod:`lino_extjs6.extjs6`.

    """

    media_name = 'ext-6.2.0'

    select_theme = False
    """Whether to let the user choose his preferred theme.
    Default `False`.

    Note that setting this to `True` will inject a field into the
    :class:`lino.modlib.users.User` model with the result that
    switching between :mod:`lino.modlib.extjs` and
    :mod:`lino_extjs6.extjs6` requires a database migration

    """

    theme_name = 'theme-classic'
    """
    The Extjs6 theme to be used.
    Available themes are:
    theme-aria,theme-classic,theme-classic-sandbox,theme-crisp,theme-crisp-touch,theme-gray,theme-neptune,
    theme-neptune-touch,theme-triton,theme-neptune-lino
    theme-classic is the default theme.
    """

    def on_ui_init(self, kernel):
        # logger.info("20140227 extjs.Plugin.on_ui_init() a")
        from .ext_renderer import ExtRenderer
        self.renderer = ExtRenderer(self)
        kernel.extjs_renderer = self.renderer

        # logger.info("20140227 extjs.Plugin.on_ui_init() b")

    def get_css_includes(self, site):
        return []

    def get_js_includes(self, settings, language):
        return []

    def get_index_view(self):
        from . import views
        return views.AdminIndex.as_view()

    def get_patterns(self):

        from django.conf import settings
        from django.conf.urls import url  # patterns
        from . import views

        self.renderer.build_site_cache()

        rx = '^'

        urlpatterns = [
            # url(rx + '/?$', views.AdminIndex.as_view()),
            url(rx + '$', views.AdminIndex.as_view()),
            url(rx + r'api/main_html$', views.MainHtml.as_view()),
            # url(rx + r'auth$', views.Authenticate.as_view()),
            url(rx + r'grid_config/(?P<app_label>\w+)/(?P<actor>\w+)$',
                views.GridConfig.as_view()),
            url(rx + r'api/(?P<app_label>\w+)/(?P<actor>\w+)$',
                views.ApiList.as_view()),
            url(rx + r'api/(?P<app_label>\w+)/(?P<actor>\w+)/(?P<pk>.+)$',
                views.ApiElement.as_view()),
            url(rx + r'restful/(?P<app_label>\w+)/(?P<actor>\w+)$',
                views.Restful.as_view()),
            url(rx + r'restful/(?P<app_label>\w+)/(?P<actor>\w+)/(?P<pk>.+)$',
                views.Restful.as_view()),
            url(rx + r'choices/(?P<app_label>\w+)/(?P<rptname>\w+)$',
                views.Choices.as_view()),
            url(rx + r'choices/(?P<app_label>\w+)/(?P<rptname>\w+)/'
                '(?P<fldname>\w+)$',
                views.Choices.as_view()),
            url(rx + r'apchoices/(?P<app_label>\w+)/(?P<actor>\w+)/'
                '(?P<an>\w+)/(?P<field>\w+)$',
                views.ActionParamChoices.as_view()),
            # the thread_id can be a negative number:
            # url(rx + r'callbacks/(?P<thread_id>[\-0-9a-zA-Z]+)/'
            #     '(?P<button_id>\w+)$',
            #     views.Callbacks.as_view())
        ]
        if settings.SITE.use_eid_applet:
            urlpatterns.append(
                url(rx + r'eid-applet-service$',
                    views.EidAppletService.as_view()))
        if settings.SITE.use_jasmine:
            urlpatterns.append(
                url(rx + r'run-jasmine$', views.RunJasmine.as_view()))
        return urlpatterns


    def setup_layout_element(self, el):
        from lino.core import elems as ext_elems
        # new after 20171227
        if isinstance(el, ext_elems.TabPanel):
            el.value_template = "Ext.create('Ext.TabPanel',%s)"
        elif isinstance(el, ext_elems.ActionParamsPanel):
            el.value_template = "Ext.create('Lino.ActionParamsPanel',%s)"
        elif isinstance(el, ext_elems.DetailMainPanel):
            el.value_template = "Ext.create('Ext.Panel',%s)"
        elif isinstance(el, ext_elems.GridElement):
            pass
        elif isinstance(el, ext_elems.Panel):
            el.value_template = "Ext.create('Ext.Panel',%s)"
        elif isinstance(el, ext_elems.Container):
            el.value_template = "Ext.create('Ext.Container',%s)"
        elif isinstance(el, ext_elems.HtmlBoxElement):
            el.value_template = "Ext.create('Lino.HtmlBoxPanel',%s)"
        elif isinstance(el, ext_elems.RecurrenceElement):
            el.value_template = "Ext.create('Ext.ensible.cal.RecurrenceField',%s)"
        elif isinstance(el, ext_elems.BooleanFieldElement):
            el.value_template = "Ext.create('Ext.form.Checkbox',%s)"
        elif isinstance(el, ext_elems.NumberFieldElement):
            el.value_template = "Ext.create('Ext.form.NumberField',%s)"
            el.grid_column_template = "Ext.create('Lino.NullNumberColumn',%s)"
        elif isinstance(el, ext_elems.IncompleteDateFieldElement):
            el.value_template = "Ext.create('Lino.IncompleteDateField',%s)"
        elif isinstance(el, ext_elems.URLFieldElement):
            el.value_template = "Ext.create('Lino.URLField',%s)"
        elif isinstance(el, ext_elems.DateFieldElement):
            el.value_template = "Ext.create('Lino.DateField',%s)"
        elif isinstance(el, ext_elems.DatePickerFieldElement):
            el.value_template = "Ext.create('Lino.DatePickerField',%s)"
        elif isinstance(el, ext_elems.TimeFieldElement):
            el.value_template = "Ext.create('Lino.TimeField',%s)"
        elif isinstance(el, ext_elems.SimpleRemoteComboFieldElement):
            el.value_template = "Ext.create('Lino.SimpleRemoteComboFieldElement',%s)"
        elif isinstance(el, ext_elems.RemoteComboFieldElement):
            el.value_template = "Ext.create('Lino.RemoteComboFieldElement',%s)"
        elif isinstance(el, ext_elems.ChoicesFieldElement):
            el.value_template = "Ext.create('Lino.ChoicesFieldElement',%s)"
        elif isinstance(el, ext_elems.CharFieldElement):
            el.value_template = "Ext.create('Ext.form.TextField',%s)"
        elif isinstance(el, ext_elems.DisplayElement):
            el.value_template = "Ext.create('Ext.form.DisplayField',%s)"
        elif isinstance(el, ext_elems.Spacer):
            el.value_template = "Ext.create('Ext.Spacer',%s)"

        elif isinstance(el, ext_elems.Toolbar):
            el.value_template = "Ext.create('Ext.Toolbar',%s)"
        elif isinstance(el, ext_elems.ComboBox):
            el.value_template = "Ext.create('Ext.form.ComboBox',%s)"
        elif isinstance(el, ext_elems.ExtPanel):
            el.value_template = "Ext.create('Ext.Panel',%s)"
        elif isinstance(el, ext_elems.Calendar):
            el.value_template = "Ext.create('Lino.CalendarPanel',%s)"
