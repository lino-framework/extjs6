# -*- coding: UTF-8 -*-
# Copyright 2017 Rumma & Ko Ltd
# License: BSD (see file COPYING for details)

from lino.utils.djangotest import WebIndexTestCase

from lino.utils.djangotest import RemoteAuthTestCase


class TestCase(RemoteAuthTestCase):

    def test(self):

        self.assertEqual(1+1, 2)
