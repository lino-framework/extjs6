from atelier.invlib import setup_from_tasks
ns = setup_from_tasks(
    globals(), "lino_extjs6",
    languages="en de fr et".split(),
    # tolerate_sphinx_warnings=True,
    blogref_url = 'https://luc.lino-framework.org',
    revision_control_system='git',
    # locale_dir='lino_extjs/extjs/locale',
    cleanable_files=['docs/api/lino_extjs6.*'],
    demo_projects=[
        'lino_extjs6.projects.team6',
        'lino_extjs6.projects.lydia6'])
