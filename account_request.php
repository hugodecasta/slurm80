<?php

$requestData = file_get_contents('php://input');
file_put_contents(__DIR__ . '/last_request.json', $requestData);

exec('node ' . escapeshellarg(__DIR__ . '/send_request.js'), $output, $returnCode);

$mailSent = ($returnCode === 0);

if ($mailSent) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send email']);
}
?>
