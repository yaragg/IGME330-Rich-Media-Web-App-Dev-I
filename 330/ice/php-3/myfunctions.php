<?php
	//make an unordered list
	function make_ul($array){
		$html = "<ul>";
		foreach($array as $item){
			$html .= "<li>$item</li>";
		}
		$html .= "</ul>";
		return $html;
	}

	function make_footer($name, $year){
		$footer = "<footer>&copy; $year $name</footer>";
		return $footer;
	}
?>