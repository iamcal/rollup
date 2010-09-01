rollup
======

A tool for aggregating sample data.

Rollup is great for aggregating & graphing high-volume sample data (like timings in a web app) where you 
need more than just an average. Rollup lets you easily track averages, low and high bounds and 85th percentile
(or 95th, or whatever you like). For simple pass/fail data it can also display useful success rate data. This
can be coupled with more complex timing data to get a rich view of your application's performance.


This tool is based on <a href="http://github.com/iamcal/Flickr-StatsD">Flickr::StatsD</a> which I wrote a long time ago.
The main issue with StatsD was that it used a ton of CPU. This version does not. You can read all about StatsD and
how it works <a href="http://code.flickr.com/blog/2008/10/27/counting-timing/">here</a>.

It's also far more pluggable. Take a look at how the RRDWriter is plugged into the Collector.
Writing your own storage class is very simple.


Usage
-----

Modify the config settings at the top of <code>rollup.js</code>, and then just <code>node rollup.js</code>.
