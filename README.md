Junkyard Jumbotron
==================

The Junkyard Jumbotron lets you take a bunch of random displays and
instantly stitch them together into a large, virtual display, simply
by taking a photograph of them. It works with laptops, smartphones,
tablets --- anything that runs a web browser. It also highlights a new
way of connecting a large number of heterogenous devices to each other
in the field, on an ad-hoc basis.

Here are instructions for installing the Junkyard Jumbotron.  Most of
these packages are available via apt-get on Linux, or in MacPorts or
Homebrew of OS X (deployments are intended to be on Ubuntu or Debian
boxes, and currently most development happens on OS X).

1. Git
------

You'll need a git client to get the source code.  Git is a distributed
source code management system.  You can get a client from the [git
homepage](http://git-scm.com/).

2. Node & NPM
-------------

Junkyard Jumbotron runs on top of node.js (using it as a web application
server).  You need to install Node.js from http://nodejs.org/
NPM is a simple package management system for node packages.  Follow [their
installation instructions](http://npmjs.org/).

tested version : Node v0.11.2 (installed via nvm), npm v1.2.21
manual change to be made in log4j lib line 519 of node_modules/log4js/lib/log4js.js to remove use of require.path

3. Python & Python Imaging
--------------------------

The Junkyard Jumbotron's image processing is all done in Python, utilizing
a wrapper around the ARToolkitPlus augmented reality tracking library.  You
need to install Python 2.6 or 2.7 from their [downloads page](http://www.python.org/download/).

To support the image processing you also need the
~~[Python Imaging Library](http://www.pythonware.com/products/pil/).~~
PIL is know deprecated use [pillow](https://pillow.readthedocs.io/en/latest/) instead.

You also need to compile the ARToolkit, which is included in the repo:

    > make python-extension

4. GraphicsMagick
-----------------

To support the image manipulation you also need the
[GraphicsMagick library](http://www.graphicsmagick.org/).

version tested : 1.3.18

5. Node Packages
----------------

The Junkyard Jumbotron server relies on a number of node.js packages.  You
can install them all by running this command:

    > make node-packages

6. ffmpeg
----------------

To manage video instead of phots

    > sudo apt install ffmpeg


7. Run It!
----------

To run it just do:

    > node jjserver.js

See deploy README to run as a deamon
