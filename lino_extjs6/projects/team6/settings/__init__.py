from lino_book.projects.team.settings import *


class Site(Site):
    default_ui = 'lino_extjs6.extjs'
    project_name = "extjs6_team"
    title = "Team Lino ExtJS 6 demo"
    languages = ['en', 'fr', 'de']
