# Mari Novel

Website perpustakaan novel digital berbahasa Indonesia dengan katalog, ruang baca, dan Studio Penulis.

## Menjalankan proyek
1. Ekstrak ZIP.
2. Buka folder `mari-novel` di Visual Studio Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server.
4. Website dapat dibuka tanpa npm atau proses build.

## Fitur pembaca
- Beranda, katalog, genre, pencarian, detail novel, dan tautan sumber.
- Favorit, riwayat, progres bacaan, dan tema gelap/terang.
- Ruang baca dengan pengaturan ukuran tulisan dan tema baca.

## Studio Penulis
- Membuat karya dengan judul, nama pena, genre, sinopsis, bab pertama, dan isi naskah.
- Menyimpan draf atau menerbitkan karya ke daftar karya pribadi.
- Mengedit dan menghapus karya.
- Impor naskah `.txt` dan `.md` serta unggah sampul JPG/PNG/WebP.
- Membaca karya yang diterbitkan melalui halaman detail dan ruang baca.

## Penyimpanan dan Firebase
Data pembaca dan Studio Penulis pada versi ini disimpan di LocalStorage browser. Artinya, data hanya tersedia pada browser/perangkat yang sama dan dapat terhapus jika data situs dibersihkan. Integrasi cloud Firebase belum aktif karena konfigurasi proyek milik pengguna belum tersedia. Lihat `FIREBASE-SETUP.md` untuk langkah aktivasi Authentication, Firestore, dan Storage.

## Batasan format
Editor saat ini menerima `.txt` dan `.md`. PDF/EPUB belum dikonversi menjadi bab yang dapat dibaca di ruang baca. Katalog novel berhak cipta hanya menyediakan sinopsis dan tautan sumber resmi; teks ruang baca demonstrasi adalah teks original, bukan isi novel aslinya.


## Akun pembaca (tanpa database)
Mari Novel menyediakan fitur Buat Akun, Masuk, Keluar, dan profil lokal. Data akun disimpan di localStorage browser; kata sandi disimpan sebagai hash SHA-256 jika Web Crypto tersedia. Fitur ini ditujukan untuk demonstrasi/offline lokal, bukan autentikasi produksi. Akun tidak tersinkron antarperangkat dan dapat hilang jika data browser dihapus.

Untuk menjalankan: buka `index.html` melalui Live Server. Disarankan menggunakan browser modern.

## Pembaruan tampilan
- Hero dengan sampul unggulan, sampul buku tampil apa adanya (tanpa overlay ganda), navigasi dengan garis aktif, animasi masuk halus.
- Ruang baca: tema terang/sepia/gelap, pilihan huruf serif/sans, estimasi menit baca, navigasi panah kiri/kanan.
- Detail novel: bagian "Bacaan serupa". Beranda: tombol "Acak satu cerita". Tekan `/` untuk fokus ke pencarian.

## Akun dan Karya saya
- Setelah Buat Akun atau Masuk, pengguna langsung masuk ke halaman akun.
- Studio Penulis memerlukan akun. Karya yang diunggah disimpan atas nama akun tersebut dan tampil di menu **Karya saya** (`#/karya-saya`).
- Menu Karya saya menampilkan karya dan draf milik akun yang sedang masuk, dengan tombol Baca, Edit, dan Hapus. Akun lain di browser yang sama tidak melihat karya tersebut.
- Tidak ada karya contoh yang dimasukkan otomatis; semua karya berasal dari unggahan pengguna.

## Karya komunitas di beranda
Beranda menampilkan bagian "Karya komunitas" berisi karya berstatus Diterbitkan. Pengunjung (termasuk yang belum masuk) dapat membuka dan membacanya. Karena belum memakai server, karya hanya terlihat di browser/perangkat tempat karya diunggah.

## Ekspor karya ke karya.json (agar tampil di semua perangkat)
Di Karya saya, tombol **Ekspor karya** menghasilkan `karya.json` berisi karya berstatus Diterbitkan. Taruh file itu sejajar dengan `index.html` lalu unggah ke GitHub. Beranda membaca `karya.json` otomatis, sehingga karya tampil dan bisa dibaca di perangkat mana pun yang membuka situs. Akun dan penulisan karya tetap per browser. Setiap ada karya baru atau perubahan, ekspor dan unggah ulang `karya.json`. Membaca `karya.json` memerlukan situs dibuka lewat http(s) (GitHub Pages atau Live Server), bukan dibuka langsung dari file.
