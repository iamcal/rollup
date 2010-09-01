<?php
	log_value('localhost', 8464, "hello:1");
	log_value('localhost', 8464, "world:1");

	echo "ok\n";

	function log_value($server, $port, $value){

		$fp = fsockopen("udp://$server", $port, $errno, $errstr);
		if ($fp){
			fwrite($fp, "$value\n");
			fclose($fp);
		}
	}
?>
