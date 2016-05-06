<?php
	$data = file_get_contents("http://www.gop.com");
	echo "<h1>Here's your data!!</h1>\n" . $data;
	//the dot above is used to concatenate the strings
?>