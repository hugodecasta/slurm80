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
$squeue = null;

if($config['gmethod'] == 'sinfo') {
    $sinfo = shell_exec('sinfo --json');
    $squeue = shell_exec('squeue --json');
}

if($config['gmethod'] == 'file') {
    $filename = 'fake_sinfo.json';
    $sinfo = file_get_contents($filename);
    $filename = 'fake_squeue.json';
    $squeue = file_get_contents($filename);
}

$sinfo = json_decode($sinfo);
$squeue = json_decode($squeue);

// ---------------------------------------------- GATHER

$filedata = array(
    "name"=> $config['name'],
    "logo"=> $config['logo'],
    "interval"=> $config['interval'],
    "sinfo"=> $sinfo,
    "squeue"=> $squeue,
);

echo(json_encode($filedata));

?>