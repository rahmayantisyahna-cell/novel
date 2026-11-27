# Persiapan Firebase untuk Mari Novel

Versi ini sudah memiliki Studio Penulis yang berjalan secara lokal di browser. Agar akun, naskah, sampul, favorit, dan progres membaca tersimpan online dan bisa diakses lintas perangkat, proyek Firebase perlu dibuat dan konfigurasi dari pemilik proyek perlu dimasukkan.

## Layanan Firebase yang akan digunakan
- **Authentication**: pendaftaran, login, dan identitas penulis/pembaca.
- **Cloud Firestore**: profil, metadata novel, bab, favorit, dan progres baca.
- **Cloud Storage**: sampul dan berkas naskah.

## Yang perlu disiapkan
1. Buat proyek di https://console.firebase.google.com/.
2. Tambahkan aplikasi Web pada proyek tersebut.
3. Aktifkan Authentication (Email/Password), Firestore Database, dan Storage.
4. Salin konfigurasi aplikasi Web (`apiKey`, `authDomain`, `projectId`, dan seterusnya).
5. Kirim konfigurasi tersebut atau masukkan ke berkas konfigurasi saat integrasi cloud diaktifkan.

**Penting:** jangan pernah mengirim private key/service account ke browser atau menaruhnya di file JavaScript publik. Aturan keamanan Firestore dan Storage harus membatasi data berdasarkan `request.auth.uid`. Jangan gunakan aturan akses publik untuk produksi.

## Status fitur saat ini
Studio Penulis mendukung membuat karya, menyimpan draf, menerbitkan karya ke daftar karya pribadi, mengedit/menghapus karya, mengimpor naskah `.txt`/`.md`, dan menambahkan sampul gambar. Penyimpanan masih memakai LocalStorage sehingga hanya tersedia pada browser/perangkat yang sama. Sinkronisasi Firebase belum aktif karena konfigurasi proyek Firebase belum diberikan.

PDF/EPUB belum diimpor menjadi bab yang dapat dibaca langsung di ruang baca; gunakan naskah `.txt` atau `.md` untuk editor saat ini.
