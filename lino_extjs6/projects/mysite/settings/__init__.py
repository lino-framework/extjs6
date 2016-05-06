from lino.projects.std.settings import Site


class Site(Site):

    default_ui = 'lino_extjs6.extjs'
    project_name = "extjs6_mysite"
    title = "Lino ExtJS 6 demo"

    # mostly copied from parents...
    languages = "en de"
    demo_fixtures = 'std demo demo2'
    user_profiles_module = 'lino.modlib.office.roles'

    def setup_quicklinks(self, ar, tb):
        tb.add_action(self.modules.contacts.Persons.detail_action)
        tb.add_action(self.modules.contacts.Companies.detail_action)

    def get_admin_main_items(self, ar):
        yield self.modules.cal.MyEvents

    def get_installed_apps(self):
        # modified copy of original without super.
        # TODO: find a better solution
        if self.django_admin_prefix:
            yield 'django.contrib.admin'
        yield 'django.contrib.staticfiles'
        yield 'lino.modlib.about'


        # for a in super(Site, self).get_installed_apps():
        #     yield a
        yield 'lino_extjs6.extjs'
        yield 'lino.modlib.bootstrap3'

        for a in self.local_apps:
            yield a

        yield 'lino.modlib.system'
        yield 'lino.modlib.users'
        yield 'lino.modlib.contacts'
        yield 'lino_xl.lib.cal'
        yield 'lino.modlib.export_excel'
