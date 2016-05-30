"""
.. autosummary::
   :toctree:

    extjs6
    projects

"""


import os

execfile(os.path.join(os.path.dirname(__file__), 'setup_info.py'))
__version__ = SETUP_INFO['version']

intersphinx_urls = dict(docs="http://extjs6.lino-framework.org")
srcref_url = 'https://github.com/lsaffre/lino_extjs6/blob/master/%s'
