from lino.utils.pythontest import TestCase
from lino_extjs6 import SETUP_INFO


class PackagesTests(TestCase):
    def test_01(self):
        self.run_packages_test(SETUP_INFO['packages'])


class ProjectsTests(TestCase):
    
    def test_mysite(self):
        self.run_django_manage_test("lino_extjs6/projects/mysite")

