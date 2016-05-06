<?php
//get the first number passed in and assign it to $num1
$num1 = $_GET['num1'];
//get the second number passed in and assign it to $num2
$num2 = $_GET['num2'];
//add the numbers and store them in $sum
$sum = $num1 + $num2;
/*Tell the requester that the MIME type (Multi-purpose Internet Mail Extension) of this content is text. Other "Content-type" headers we could have sent are text/html (the default), image/jpeg, image/gif, image/png, video/quicktime, application/vnd.ms-powerpoint or many, many others*/
header("Content-type: text/plain");

//Send the result back to whatever client application requested it
echo $sum
?>