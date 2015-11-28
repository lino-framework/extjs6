# -*- coding: UTF-8 -*-
# Copyright 2015 Luc Saffre
# License: GPL (see file COPYING for details)

# ~ Note that this module may not have a docstring because any
# ~ global variable defined here will override the global
# ~ namespace of lino/__init__.py who includes it with execfile.

# This module is part of the Lino test suite.
# To test only this module:
#
#   $ python setup.py test -s tests.PackagesTests

from __future__ import unicode_literals

SETUP_INFO = dict(
    name='lino_extjs6',
    version='0.0.1',
    install_requires=['lino'],
    tests_require=[],

    description="The Sencha ExtJS 6 user interface for Lino",
    license='GPLv6+',
    include_package_data=False,
    zip_safe=False,
    author='Luc Saffre',
    author_email='luc.saffre@gmail.com',
    url="http://www.lino-framework.org",
    # test_suite='tests',
    classifiers="""\
  Programming Language :: Python
  Programming Language :: Python :: 2
  Development Status :: 5 - Production/Stable
  Environment :: Web Environment
  Framework :: Django
  Intended Audience :: Developers
  Intended Audience :: System Administrators
  License :: OSI Approved :: GPL
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

""")

SETUP_INFO.update(packages=[str(n) for n in """
lino_extjs6
lino_extjs6.extjs
lino_extjs6.projects
lino_extjs6.projects.mysite
lino_extjs6.projects.mysite.settings
""".splitlines() if n])
