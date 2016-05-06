<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Yara's Favorite Movies</title>
	<style>
	*{
	font-family:verdana,tahoma,sans-serif;
	}
	footer{
		margin-top: 1em;
		color:gray;
	}
	a,a:link{
		text-decoration: none;
		color: blue;
	}

	a:hover{
		color:red;
		text-decoration: underline;
	}
	</style>
</head>
<body>
<h1>My Favorite Movies</h1>
<!-- Dynamic Content Start -->

<?php
	include("myfunctions.php");
	
	// now start calling the functions you wrote
	$movies = ["Sybil", "A Beautiful Mind", "Requiem for a Dream"];
	echo make_ul($movies) . make_footer("Yara Grassi Gouffon", 2016);
	
?>

<!-- Dynamic Content End -->
</body>
</html>