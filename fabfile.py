from atelier.fablib import *
setup_from_fabfile(globals(), 'lino_extjs6')

#env.locale_dir = 'lino/modlib/lino_startup/locale'
env.languages = "en de fr et".split()
# env.tolerate_sphinx_warnings = True

# add_demo_project('lino.projects.cms.settings')

env.revision_control_system = 'git'

env.cleanable_files = ['docs/api/lino_extjs6.*']
