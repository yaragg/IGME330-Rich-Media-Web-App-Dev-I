<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Greeter!</title>
	<style type="text/css">
	*{
		font-size: 150%;
		font-family: verdana;
	}
	</style>
</head>
<body>
	<strong><?php
		if(array_key_exists('first', $_GET)) $first = $_GET['first'];
			else $first = "John";
		if(array_key_exists('first', $_GET)) $last = $_GET['last'];
			else $last = "Doe";
		echo "Nice to see you, \"" . $first . " " . $last . "\"!";
	?></strong>
</body>


</html>