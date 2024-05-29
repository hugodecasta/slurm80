<?php

// ---------------------------------------------- PARSE DATA

$lines = file('DATA');

$config = [];

foreach ($lines as $line) {
    $parts = explode('=', $line, 2);

    if (count($parts) == 2) {
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $config[$key] = $value;
    }
    else {
        throw "Wrong DATA file content";
    }
}

// ---------------------------------------------- SINFO

$sinfo = null;

if($config['gmethod'] == 'sinfo') {
    $sinfo = shell_exec('sinfo --json');
}

if($config['gmethod'] == 'file') {
    $filename = $config['filename'];
    $sinfo = file_get_contents($filename);
}

$sinfo = json_decode($sinfo);

// ---------------------------------------------- GATHER

$filedata = array(
    "name"=> $config['name'],
    "logo"=> $config['logo'],
    "interval"=> $config['interval'],
    "sinfo"=> $sinfo,
);

echo(json_encode($filedata));

?>