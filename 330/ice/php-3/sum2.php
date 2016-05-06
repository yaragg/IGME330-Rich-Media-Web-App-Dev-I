<?php
	function addThemUp($a, $b){
		return $a + $b;
	}

	$num1 = 0;
	$num2 = 0;
	if(array_key_exists('num1', $_GET)) $num1 = $_GET['num1'];
	if(array_key_exists('num2', $_GET)) $num2 = $_GET['num2'];
	echo addThemUp($num1, $num2);
?>
