# API Beasiswa v1

API Laravel publik, respons JSON, tanpa login atau CSRF. Batas per IP: 60 permintaan/menit; tanya AI 5 permintaan/menit.

## Daftar dan detail

`GET /api/v1/beasiswa?q=teknik&level=S2&per_page=10`

Filter opsional: `q` (judul/ringkasan), `level` (jenjang), `location`, `source_id`, `deadline_before` (`YYYY-MM-DD`), `per_page` (1–50, default 10), `page`.

Respons daftar berisi `data`, `links`, dan `meta` pagination. `GET /api/v1/beasiswa/{id}` mengembalikan satu objek dalam `data`.

Hanya beasiswa disetujui dengan tenggat hari ini atau sesudahnya (atau belum diketahui). Organisasi terkait harus disetujui; sumber scraper terkait harus aktif dan bertipe beasiswa. Data manual yang disetujui juga tersedia di katalog API.

Objek beasiswa: `id`, `title`, `summary`, `details`, `deadline`, `source_url`, `organizer`, `source` (`id`, `name`, `url`, `last_run_at`), `updated_at`.

## Tanya AI

```sh
curl -X POST http://localhost:8000/api/v1/beasiswa/tanya \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"question":"Apa saja beasiswa untuk S2?"}'
```

`question` wajib, maksimal 1000 karakter. `source_id` opsional untuk membatasi website sumber. `scholarship_id` opsional untuk membatasi konteks AI ke satu beasiswa; beasiswa yang tidak tersedia di katalog publik menghasilkan `404`; beasiswa manual yang disetujui juga dapat ditanyakan dengan ID.

Respons: `answer` (teks), `references` (data beasiswa yang diberikan sebagai konteks ke AI), `sources` (website aktif terdaftar dengan waktu pengambilan terakhir). Referensi adalah kandidat konteks; tidak seluruhnya harus disebut di jawaban.

AI menggunakan maksimal 30 beasiswa dari hasil scraper website beasiswa aktif terdaftar. Pencarian kata kunci diprioritaskan; jika tidak ada kecocokan, digunakan data terbaru. Data manual dan sumber tanpa URL tidak masuk konteks AI. Jawaban berdasarkan salinan data tersimpan, bukan pengambilan langsung setiap pertanyaan. Jika kosong, respons menjelaskan data belum tersedia tanpa memanggil AI.

Tambahkan website melalui menu admin scraper Beasiswa dan jalankan pengambilan data. Horizon memproses job; scheduler Laravel diperlukan untuk pembaruan terjadwal. Integrasi AI memakai konfigurasi `config/hermes.php` dan variabel `HERMES_*` yang sudah ada.

Status: `200` berhasil, `404` data tidak tersedia, `422` input tidak valid, `429` batas permintaan, `503` layanan AI gagal.
