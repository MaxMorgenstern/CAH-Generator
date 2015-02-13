<?php
$passed_folder = '';
if (isset($_POST["folder"])) {
	$passed_folder = $_POST["folder"] . "/";

}elseif (isset($_GET["folder"])) {
	$passed_folder = $_GET["folder"] . "/";
}

$working_dir = __DIR__.'/generated/'.$passed_folder;
$current_files = array();

if ($handle = opendir($working_dir)) {
    while (false !== ($file = readdir($handle))) {

    	// TODO: no . at beginning, no .zip at end
        
        if ($file != "." && $file != ".." && $file != ".DS_Store" && $file != "CAH-Archive.zip" && !is_dir($working_dir.$file)) {
            array_push($current_files, $file);
        }
    }
    closedir($handle);
}

$zip_creation = create_zip($working_dir, $current_files, $working_dir.'CAH-Archive.zip', true);

if($zip_creation){
	$download_file_name = $working_dir.'CAH-Archive.zip';

	if(ini_get('zlib.output_compression')) { ini_set('zlib.output_compression', 'Off');	}

	header("Content-type: application/zip");
	header('Pragma: public');
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	header('Last-Modified: '.gmdate ('D, d M Y H:i:s', filemtime ($download_file_name)).' GMT');
	header('Cache-Control: private',false);
	header('Content-Type: '.$mime);
	header('Content-Disposition: attachment; filename="'.basename($download_file_name).'"');
	header('Content-Transfer-Encoding: binary');
	header('Content-Length: '.filesize($download_file_name));
	header('Connection: close');
	readfile($download_file_name);
	exit();
}

/***************************/

function create_zip($file_path, $passed_files, $zip_destination, $overwrite = false) {
	if(file_exists($zip_destination) && !$overwrite) { return false; }
	$valid_files = array();

	if(is_array($passed_files)) {
		foreach($passed_files as $file_name) {
			if(file_exists($file_path.$file_name)) {
				$valid_files[] = $file_name;
			}
		}
	}
	
	if(count($valid_files)) {
		$zip = new ZipArchive();
		if($zip->open($zip_destination, $overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
			return false;
		}

		foreach($valid_files as $file_name) {
			$zip->addFile($file_path.$file_name, $file_name);
		}

		$zip->close();
		
		return file_exists($zip_destination);
	} else {
		return false;
	}
}

?>