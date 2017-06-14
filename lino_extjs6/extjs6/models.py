# -*- coding: UTF-8 -*-
# Copyright 2015-2016 Luc Saffre
# License: BSD (see file COPYING for details)
"""Database models for :mod:`extjs6`.

"""

from __future__ import unicode_literals

import logging

logger = logging.getLogger(__name__)

from django.utils.translation import ugettext_lazy as _

from lino.api import dd

from lino.modlib.users.desktop import Users, UserDetail
from django.db import models

EXTJS6_THEMES_CHOICES = (
    ("theme-classic", "Theme classic"),
    ("theme-aria", "Theme Aria"),
    ("theme-classic", "Theme Classic"),
    ("theme-classic-sandbox", "Theme Classic Sandbox"),
    ("theme-crisp", "Theme Crisp"),
    ("theme-crisp-touch", "Theme crisp touch"),
    ("theme-gray", "Theme gray"),
    ("theme-neptune", "Theme neptune"),
    ("theme-neptune-touch", "Theme neptune touch"),
    ("theme-triton", "Theme triton"),
)

if dd.plugins.extjs6.select_theme:
    dd.inject_field(
        'users.User', 'preferred_theme',
        models.CharField(_("Preferred theme"), choices=EXTJS6_THEMES_CHOICES, default="", blank=True, max_length=25))
else:
    dd.inject_field('users.User', 'preferred_theme', dd.DummyField())


class ThemedUserDetail(UserDetail):
    box1 = """
        username user_type:20 partner
        first_name last_name initials
        email language timezone preferred_theme
        id created modified
        """


Users.set_detail_layout(ThemedUserDetail())
