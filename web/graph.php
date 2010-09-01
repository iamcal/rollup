<?php
	include('config.php');

	
	function get_time($r){
		if($r == 'hour'){
			return 3600;
		} elseif ($r == 'day'){
			return 86400;
		} elseif ($r == 'week'){
			return 604800;
		} elseif ($r == 'month'){
			return 2419200;
		} elseif ($r == 'year'){
			return 31449600;
		
		} elseif (preg_match('!(\d+)h!',$r, $m)){
			return 3600 * intval($m[1]);
		} elseif (preg_match('!(\d+)d!',$r, $m)){ 
			return 86400 * intval($m[1]); 
		} elseif (preg_match('!(\d+)w!',$r, $m)){ 
			return 604800 * intval($m[1]); 
		} elseif (preg_match('!(\d+)m!',$r, $m)){ 
			return 2419200 * intval($m[1]); 
		} elseif (preg_match('!(\d+)y!',$r, $m)){ 
			return 31449600 * intval($m[1]); 
		}
	
		return 3600;
	}

        $file = $_GET['m'];
        $file = preg_replace('![^a-zA-Z0-9-_]!', '', $file);

        $seconds = get_time($_GET['r']);

	$w = intval($_GET['w']);
	$w = ($w)?$w:400;
	$h = intval($_GET['h']);
	$h = ($h)?$h:100;
	
        $command = "$rrdtool graph - -a PNG";

        $command .= " -w $w -h $h ";
        $command .= " -l 0";
        $command .= " -s ".round(time() - $seconds);
	
	# Support for forcing an upper limit
	if ($_GET['u']){
		$u = intval($_GET['u']);
		$command .= " -u $u -r";
	}

	switch($_GET['g']){
		case 'total':
			$command .= " -v \"Samples per second\"";
			$command .= " DEF:total={$rrd_path}/$file.rrd:num:AVERAGE";

			$command .= " AREA:total#99ff99";
			$command .= " LINE0.8:total#333333";
			break;
		
		default:
			if (preg_match('!_ok$!',$file)){
				$command .= " -v \"Samples per second\"";
				$command .= " DEF:oks={$rrd_path}/$file.rrd:ok:AVERAGE";
				$command .= " CDEF:ok=oks,60,/";

				$command .= " AREA:ok#99ff99";
				$command .= " LINE0.8:ok#333333";
	
			} else {
		
				$command .= " -v \"Time (seconds)\"";
				$command .= " DEF:lo={$rrd_path}/$file.rrd:lo:AVERAGE";
				$command .= " DEF:avg={$rrd_path}/$file.rrd:avg:AVERAGE";
				$command .= " DEF:hi={$rrd_path}/$file.rrd:hi:AVERAGE";
				$command .= " DEF:hi_trim={$rrd_path}/$file.rrd:hi_trim:AVERAGE";
		
				$command .= " CDEF:qlo=avg,lo,-";
				$command .= " CDEF:qhi=hi_trim,avg,-";
				$command .= " CDEF:qtop=hi,hi_trim,-";
				
				$command .= " VDEF:amax=avg,MAXIMUM";
				$command .= " VDEF:aavg=avg,AVERAGE";
				$command .= " VDEF:amin=avg,MINIMUM";
				
				$command .= ' COMMENT:"          "';
				$command .= ' COMMENT:"Maximum    "';
				$command .= ' COMMENT:"Average    "';
				$command .= ' COMMENT:"Minimum    "';

				$command .= ' COMMENT:"          "';
				$command .= ' GPRINT:amax:"%6.2lf ms  "';
				$command .= ' GPRINT:aavg:"%6.2lf ms   "';
				$command .= ' GPRINT:amin:"%6.2lf ms"';

				$command .= " AREA:lo";
				$command .= " AREA:qlo#99ff99::STACK";
				$command .= " AREA:qhi#ff9999::STACK";

				$command .= " LINE0.8:avg#333333";
		
			}
	}

        if (isset($_GET['debug'])){

                header("Content-type: text/plain");
                echo "$command\n";
                echo "--------------------------\n";
                passthru($command." 2>&1");

        }else{
                header("Content-type: image/png");
                passthru($command);
        }
?>
