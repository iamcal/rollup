<?
	include('config.php');
?>
<html>
<head>
<title>Rollup</title>
<style>

body {
	font-family: Helvetica, Arial, sans-serif;
}

#navi {
	background-color: #eee;
	border: 1px solid #ccc;
	padding: 1em;
	margin-bottom: 3px;
}

img {
	margin-bottom: 3px;
}

</style>

</head>
<body>

<div id="navi">
	<a href="./">All Stats</a>
<? if ($_GET[m]){ ?>
	&gt; <a href="./?m=<?=$_GET[m]?>"><?=$_GET[m]?></a>
<? } ?>
</div>

<?php
	$r = $_GET['r'];
        	
	if ($_GET['m']){
		$metric = $_GET['m'];
		foreach(array('total','') as $graph){
			echo("<img src=\"graph.php?m=$metric&g=$graph&r=$r\">");
		}
	} else {
		echo("<ul>");
		foreach (glob("$rrd_path/*.rrd") as $filename) {
			if(preg_match('/\/(\w+)\.rrd$/', $filename, $m)){
				$metric = $m[1];
				echo("<li><a href=\"?m=$metric&r=$r\">$metric</a></li>");
			}
		}
		echo("</ul>");
	}
	
?>
