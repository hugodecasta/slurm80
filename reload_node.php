<?php
if (isset($_GET['nodeName'])) {
    $node_name = escapeshellarg($_GET['nodeName']);
    $command = "sudo scontrol update nodename={$node_name} state=idle";
    $output = shell_exec($command);
    echo(json_encode(true));
} else {
    echo(json_encode(false));
}
?>