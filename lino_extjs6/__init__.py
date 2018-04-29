"""
.. autosummary::
   :toctree:

    extjs
    projects

"""


import os

from os.path import join, dirname
fn = join(dirname(__file__), 'setup_info.py')
exec(compile(open(fn, "rb").read(), fn, 'exec'))
__version__ = SETUP_INFO['version']

# intersphinx_urls = dict(docs="http://extjs6.lino-framework.org")
srcref_url = 'https://github.com/lino-framework/extjs6/blob/master/%s'
doc_trees = ['docs']
