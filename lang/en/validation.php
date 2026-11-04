<?php

// Overrides only the password-rule messages from the framework's default translations,
// so the stricter production password policy explains itself in Indonesian.
return [
    'password' => [
        'letters' => 'Kata sandi harus mengandung minimal satu huruf.',
        'mixed' => 'Kata sandi harus mengandung huruf besar dan huruf kecil.',
        'numbers' => 'Kata sandi harus mengandung minimal satu angka.',
        'symbols' => 'Kata sandi harus mengandung minimal satu simbol.',
        'uncompromised' => 'Kata sandi ini pernah bocor di internet. Gunakan kata sandi lain.',
    ],
];
