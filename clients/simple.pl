#!/usr/bin/perl

use strict;
use warnings;

use IO::Socket;

&log_value('localhost', 8464, "hello:1");
&log_value('localhost', 8464, "world:1");
print "ok\n";

sub log_value {
	my ($server, $port, $value) = @_;

	my $sock = new IO::Socket::INET(
		PeerAddr => $server,
		PeerPort => $port,
		Proto => 'udp',
	) or die('Could not connect: $!');

	print $sock "$value\n";

	close $sock;
}
