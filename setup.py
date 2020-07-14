from setuptools import setup

fn = 'lino_extjs6/setup_info.py'
with open(fn, "rb") as fd:
    exec(compile(fd.read(), fn, 'exec'))

if __name__ == '__main__':
    setup(**SETUP_INFO)

