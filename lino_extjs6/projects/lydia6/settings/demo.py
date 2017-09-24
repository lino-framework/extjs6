import datetime

from lino_extjs6.projects.lydia6.settings import *


class Site(Site):
    project_name = 'lydia_extjs_demo'
    is_demo_site = True
    # ignore_dates_after = datetime.date(2019, 05, 22)
    the_demo_date = datetime.date(2015, 3, 12)

SITE = Site(globals())

SECRET_KEY = "1234"
# ALLOWED_HOSTS = ['*']
DEBUG = True
