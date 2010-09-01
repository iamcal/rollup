rollup
======

A tool for aggregating sample data.

This is based on <a href="http://github.com/iamcal/Flickr-StatsD">Flickr::StatsD</a> which I wrote a long time ago.
The main issue with StatsD was that it used a ton of CPU. This version does not.

It's also far more pluggable. Take a look at how the RRDWriter is plugged into the Collector.
Writing your own storage class is very simple.


Usage
-----

Modify the config settings at the top of <code>rollup.js</code>, and then just <code>node rollup.js</code>.
