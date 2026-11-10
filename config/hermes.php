<?php

return [
    // Through an SSH tunnel the gateway is local: ssh -N -L 8642:127.0.0.1:8642 user@hermes-host
    'base_url' => env('HERMES_BASE_URL', 'http://127.0.0.1:8642/v1'),
    // The gateway calls this secret API_SERVER_KEY.
    'token' => env('HERMES_TOKEN') ?: env('API_SERVER_KEY'),
    'connect_timeout' => (int) env('HERMES_CONNECT_TIMEOUT', 10),
    'timeout' => (int) env('HERMES_TIMEOUT', 90),
    'run_timeout' => (int) env('HERMES_RUN_TIMEOUT', 120),
    'poll_seconds' => (int) env('HERMES_POLL_SECONDS', 2),
    'endpoints' => [
        'runs' => env('HERMES_RUNS_ENDPOINT', '/runs'),
    ],
];
