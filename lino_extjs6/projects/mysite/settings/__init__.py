from lino_noi.projects.team.settings import Site


class Site(Site):
    default_ui = 'lino_extjs6.extjs6'
    project_name = "extjs6_mysite"
    title = "Lino ExtJS 6 demo"
    languages = ['en', 'fr', 'de']
