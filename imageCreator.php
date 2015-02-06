<?php
$data = 'data:image/png;base64,AAAFBfj42Pj4';
if (isset($_POST["data"])) {
	$data = $_POST["data"];
}

$filename = "dummy";
if (isset($_POST["filename"])) {
	$filename = $_POST["filename"];
}

list($type, $data) 		= explode(';', $data);
list($format, $data)    = explode(',', $data);
$data = base64_decode($data);

file_put_contents(__DIR__.'/generated/'.$filename.'.png', $data);
echo json_encode($filename);
?>