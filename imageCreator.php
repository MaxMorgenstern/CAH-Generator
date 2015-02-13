<?php
$data = 'data:image/png;base64,AAAFBfj42Pj4';
if (isset($_POST["data"])) {
	$data = $_POST["data"];
}

$filename = "dummy";
if (isset($_POST["filename"])) {
	$filename = $_POST["filename"];
}

$passed_folder = '';
if (isset($_POST["folder"])) {
	$passed_folder = $_POST["folder"] . "/";
	if (!is_dir(__DIR__.'/generated/'.$passed_folder)) {
			mkdir(__DIR__.'/generated/'.$passed_folder);
	}
}

list($type, $data) 		= explode(';', $data);
list($format, $data)    = explode(',', $data);
$data = base64_decode($data);

file_put_contents(__DIR__.'/generated/'.$passed_folder.$filename.'.png', $data);
echo json_encode($filename);
?>