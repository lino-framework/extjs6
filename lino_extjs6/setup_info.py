# -*- coding: UTF-8 -*-
# Copyright 2015-2021 Rumma & Ko Ltd
# License: GNU Affero General Public License v3 (see file COPYING for details)


SETUP_INFO = dict(
    name='lino_extjs6',
    version='17.10.0',
    install_requires=['lino', 'lino_noi'],
    tests_require=[],
    test_suite='tests',
    description="The Sencha ExtJS 6 user interface for Lino",
    license_files=['COPYING'],
    include_package_data=False,
    zip_safe=False,
    author='Rumma & Ko Ltd',
    author_email='info@lino-framework.org',
    url="https://github.com/lino-framework/ext6",
    classifiers="""\
  Programming Language :: Python
  Programming Language :: Python :: 3
  Development Status :: 1 - Planning
  Environment :: Web Environment
  Framework :: Django
  Intended Audience :: Developers
  Intended Audience :: System Administrators
  License :: OSI Approved :: GNU Affero General Public License v3
  Natural Language :: English
  Natural Language :: French
  Natural Language :: German
  Operating System :: OS Independent
  Topic :: Database :: Front-Ends
  Topic :: Home Automation
  Topic :: Office/Business
  Topic :: Software Development :: Libraries :: Application Frameworks""".splitlines())

SETUP_INFO.update(long_description="""\

The Sencha ExtJS 6 user interface for Lino

The central project homepage is http://extjs6.lino-framework.org/


""")

SETUP_INFO.update(packages=[str(n) for n in """
lino_extjs6
lino_extjs6.extjs
lino_extjs6.projects
lino_extjs6.projects.team6
lino_extjs6.projects.team6.settings
lino_extjs6.projects.team6.tests
lino_extjs6.projects.lydia6
lino_extjs6.projects.lydia6.settings
lino_extjs6.projects.lydia6.tests
""".splitlines() if n])
