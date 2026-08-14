# Requirements Document

## Introduction

Personal Dashboard adalah aplikasi web yang berfungsi sebagai halaman tab baru (New Tab Page) di browser. Aplikasi ini dibangun menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework, serta menyimpan semua data di sisi klien menggunakan browser Local Storage API. Tujuan utama aplikasi adalah menyediakan antarmuka terpusat yang bersih dan cepat bagi pengguna untuk memantau waktu, mengelola tugas harian, menggunakan timer fokus (Pomodoro), dan mengakses tautan favorit — semua dalam satu halaman tanpa memerlukan server backend. Aplikasi dapat digunakan sebagai standalone web app maupun browser extension, dan harus berjalan dengan baik di Chrome, Firefox, Edge, dan Safari versi modern.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget secara bersamaan.
- **Widget**: Komponen antarmuka mandiri yang menampilkan atau mengelola satu kelompok fitur (misalnya widget Greeting, widget Timer).
- **Greeting**: Widget yang menampilkan salam, nama pengguna, waktu, dan tanggal saat ini.
- **Focus_Timer**: Widget timer hitung mundur berbasis Pomodoro yang dapat dikonfigurasi.
- **Todo_List**: Widget pengelola daftar tugas harian pengguna.
- **Quick_Links**: Widget yang menampilkan dan mengelola kumpulan tautan favorit pengguna.
- **Theme_Manager**: Modul yang mengelola status dan peralihan tema terang/gelap.
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan semua data persisten di sisi klien.
- **Pomodoro**: Teknik manajemen waktu dengan siklus kerja 25 menit (atau durasi kustom) diikuti istirahat.
- **Session**: Satu siklus hitung mundur Focus_Timer dari waktu awal hingga nol atau dihentikan manual.
- **Task**: Satu item pekerjaan di dalam Todo_List yang memiliki teks deskripsi dan status selesai/belum selesai.
- **Quick_Link**: Satu entri di dalam Quick_Links yang memiliki label teks dan URL tujuan.
- **Theme**: Skema warna antarmuka, bernilai `light` (terang) atau `dark` (gelap).
- **Nama_Pengguna**: Nama yang dimasukkan pengguna dan ditampilkan di dalam salam pada widget Greeting.

---

## Requirements

### Requirement 1: Tampilan Waktu dan Tanggal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat waktu dan tanggal saat ini secara real-time, sehingga saya selalu mengetahui informasi waktu terkini tanpa harus melihat perangkat lain.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan jam digital dalam format HH:MM:SS menggunakan zona waktu lokal perangkat pengguna, diperbarui setiap 1 detik.
2. THE Dashboard SHALL menampilkan tanggal lengkap dalam format hari, DD Bulan YYYY (contoh: Senin, 02 Juni 2025) menggunakan zona waktu lokal perangkat pengguna, diperbarui pada pergantian hari (pukul 00:00:00 waktu lokal).
3. WHEN pengguna membuka Dashboard, THE Greeting SHALL menampilkan salam kontekstual berdasarkan jam lokal perangkat pengguna sesuai aturan berikut: "Selamat Pagi" untuk pukul 05.00–11.59, "Selamat Siang" untuk pukul 12.00–14.59, "Selamat Sore" untuk pukul 15.00–17.59, dan "Selamat Malam" untuk pukul 18.00–04.59.
4. WHILE Dashboard aktif di browser, THE Greeting SHALL memperbarui teks salam secara otomatis dalam waktu tidak lebih dari 1 detik setelah jam lokal berpindah ke periode waktu yang berbeda.
5. IF Local_Storage tidak memiliki data Nama_Pengguna, THEN THE Greeting SHALL menampilkan salam kontekstual tanpa nama pengguna (contoh: "Selamat Pagi" tanpa tambahan nama).
6. IF mekanisme pembaruan waktu gagal diinisialisasi saat Dashboard dimuat, THEN THE Dashboard SHALL menampilkan pesan indikasi bahwa waktu tidak dapat ditampilkan dan tetap menampilkan tanggal dan salam terakhir yang berhasil diambil.

---

### Requirement 2: Nama Pengguna Kustom pada Salam

**User Story:** Sebagai pengguna, saya ingin memasukkan nama saya sendiri, sehingga salam pada dashboard terasa lebih personal.

#### Acceptance Criteria

1. THE Greeting SHALL menyediakan kolom teks dan tombol simpan yang memungkinkan pengguna memasukkan dan menyimpan Nama_Pengguna, di mana aksi simpan dapat dipicu dengan mengklik tombol simpan atau menekan tombol Enter pada kolom teks.
2. WHEN pengguna menyimpan Nama_Pengguna, THE Greeting SHALL menampilkan salam dalam format "[Salam_Waktu], [Nama_Pengguna]!" di mana [Salam_Waktu] adalah salam berbasis waktu yang ditentukan oleh Persyaratan 1 (contoh: "Selamat Pagi, Budi!").
3. WHEN pengguna menyimpan Nama_Pengguna, THE Dashboard SHALL menyimpan nilai Nama_Pengguna ke Local_Storage.
4. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya, THE Greeting SHALL memuat dan menampilkan Nama_Pengguna yang telah tersimpan di Local_Storage.
5. IF pengguna menghapus isi kolom Nama_Pengguna dan menyimpan nilai kosong, THEN THE Greeting SHALL menampilkan salam dalam format "[Salam_Waktu]!" tanpa nama pengguna, dan THE Dashboard SHALL menghapus entri Nama_Pengguna dari Local_Storage.
6. THE Greeting SHALL mencegah pengguna memasukkan karakter ke-51 dan seterusnya pada kolom Nama_Pengguna, sehingga panjang Nama_Pengguna tidak dapat melebihi 50 karakter.

---

### Requirement 3: Focus Timer (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer hitung mundur Pomodoro, sehingga saya dapat bekerja dengan sesi fokus terstruktur dan meningkatkan produktivitas.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan sisa waktu dalam format MM:SS.
2. WHEN pengguna menekan tombol Start, THE Focus_Timer SHALL memulai hitung mundur dari durasi yang sedang dikonfigurasi.
3. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan sisa waktu setiap detik.
4. WHEN pengguna menekan tombol Stop, THE Focus_Timer SHALL menghentikan hitung mundur dan mempertahankan sisa waktu pada posisi terakhir.
5. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitung mundur dan mengembalikan tampilan sisa waktu ke durasi yang sedang dikonfigurasi.
6. WHEN hitung mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menampilkan elemen notifikasi visual yang terlihat pada layar yang menyatakan sesi telah selesai, dan elemen tersebut tetap ditampilkan hingga pengguna melakukan interaksi berikutnya atau selama minimal 5 detik.
7. WHEN hitung mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL memutar notifikasi audio sekali sebagai tanda sesi selesai.
8. WHEN hitung mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL mereset tampilan ke durasi yang sedang dikonfigurasi secara otomatis dan berhenti dalam keadaan tidak aktif (tidak memulai ulang secara otomatis).
9. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menonaktifkan tombol Start dan mengaktifkan tombol Stop.
10. WHILE Focus_Timer dalam keadaan tidak aktif atau dihentikan, THE Focus_Timer SHALL mengaktifkan tombol Start dan menonaktifkan tombol Stop.

---

### Requirement 4: Konfigurasi Durasi Pomodoro

**User Story:** Sebagai pengguna, saya ingin mengubah durasi timer Pomodoro sesuai preferensi saya, sehingga saya dapat menyesuaikan sesi fokus dengan kebutuhan pekerjaan.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menyediakan antarmuka untuk memasukkan durasi timer dalam satuan menit.
2. THE Focus_Timer SHALL menerima input durasi berupa bilangan bulat dalam rentang 1 hingga 120 menit.
3. WHEN pengguna menyimpan durasi kustom, THE Focus_Timer SHALL memperbarui tampilan sisa waktu ke durasi baru dalam format MM:SS.
4. WHEN pengguna menyimpan durasi kustom, THE Dashboard SHALL menyimpan nilai durasi ke Local_Storage.
5. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya, THE Focus_Timer SHALL memuat durasi kustom dari Local_Storage dan menggunakannya sebagai durasi default.
6. IF pengguna memasukkan nilai di luar rentang 1–120, nilai bukan bilangan bulat, atau nilai bukan angka, THEN THE Focus_Timer SHALL menampilkan pesan kesalahan yang menjelaskan batasan input yang valid, mempertahankan nilai yang ada di field input, tidak mengubah durasi aktif yang sedang digunakan, dan TIDAK menyimpan nilai tersebut ke Local_Storage.
7. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menampilkan antarmuka pengaturan durasi dalam kondisi dinonaktifkan (disabled) sehingga tidak dapat diinteraksi oleh pengguna.
8. IF Local_Storage tidak memiliki data durasi kustom, THEN THE Focus_Timer SHALL menggunakan durasi default 25 menit.

---

### Requirement 5: Pengelolaan Daftar Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya, sehingga saya dapat melacak pekerjaan yang perlu dilakukan dan yang telah selesai.

#### Acceptance Criteria

1. THE Todo_List SHALL menyediakan kolom input teks dan tombol untuk menambahkan Task baru.
2. WHEN pengguna menambahkan Task baru, THE Todo_List SHALL menampilkan Task tersebut dalam daftar dengan status awal belum selesai.
3. WHEN pengguna menambahkan Task baru, THE Dashboard SHALL menyimpan seluruh daftar Task ke Local_Storage.
4. THE Todo_List SHALL membatasi panjang teks Task maksimal 200 karakter.
5. IF pengguna mencoba menambahkan Task dengan teks yang kosong atau hanya mengandung spasi, THEN THE Todo_List SHALL menampilkan pesan kesalahan yang menginformasikan bahwa teks Task tidak boleh kosong, tidak menambahkan Task ke daftar, dan mempertahankan isi kolom input.
6. THE Todo_List SHALL menyediakan mekanisme bagi pengguna untuk menandai Task sebagai selesai.
7. WHEN pengguna menandai Task sebagai selesai, THE Todo_List SHALL menerapkan setidaknya satu penanda visual permanen pada Task tersebut — yaitu teks dicoret — untuk membedakannya secara visual dari Task yang belum selesai.
8. WHEN pengguna menandai Task sebagai selesai, THE Dashboard SHALL memperbarui status Task di Local_Storage.
9. WHEN pengguna menandai Task yang sudah selesai, THE Todo_List SHALL mengubah status Task menjadi belum selesai dan menghapus penanda visual penyelesaian dari Task tersebut.
10. WHEN pengguna menandai Task yang sudah selesai, THE Dashboard SHALL memperbarui status Task di Local_Storage.
11. THE Todo_List SHALL menyediakan mekanisme bagi pengguna untuk mengedit teks Task yang sudah ada.
12. WHEN pengguna menyimpan hasil edit teks Task, THE Dashboard SHALL memperbarui teks Task di Local_Storage.
13. IF pengguna mencoba menyimpan hasil edit dengan teks yang kosong atau hanya mengandung spasi, THEN THE Todo_List SHALL menampilkan pesan kesalahan yang menginformasikan bahwa teks Task tidak boleh kosong dan mempertahankan teks Task sebelumnya tanpa menyimpan perubahan.
14. IF pengguna membatalkan proses edit sebelum menyimpan, THEN THE Todo_List SHALL menutup mode edit dan mempertahankan teks Task yang tidak berubah tanpa memperbarui Local_Storage.
15. THE Todo_List SHALL menyediakan tombol hapus pada setiap Task.
16. WHEN pengguna menghapus Task, THE Todo_List SHALL menghilangkan Task tersebut dari daftar secara permanen.
17. WHEN pengguna menghapus Task, THE Dashboard SHALL memperbarui daftar Task di Local_Storage.
18. WHEN pengguna membuka Dashboard untuk pertama kali atau ketika Local_Storage tidak mengandung data Task, THE Todo_List SHALL menampilkan daftar Task kosong tanpa pesan kesalahan.
19. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya, THE Todo_List SHALL memuat dan menampilkan seluruh Task beserta statusnya dari Local_Storage.

---

### Requirement 6: Pengelolaan Tautan Favorit (Quick Links)

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan favorit saya dengan cepat, sehingga saya dapat membuka website yang sering dikunjungi tanpa perlu mengetik URL secara manual.

#### Acceptance Criteria

1. THE Quick_Links SHALL menyediakan antarmuka untuk menambahkan Quick_Link baru dengan kolom input label teks maksimal 30 karakter dan kolom input URL maksimal 2048 karakter.
2. WHEN pengguna menambahkan Quick_Link baru dan jumlah Quick_Link saat ini kurang dari 20, THE Quick_Links SHALL menampilkan Quick_Link tersebut sebagai tombol atau kartu yang dapat diklik.
3. WHEN pengguna menambahkan Quick_Link baru, THE Dashboard SHALL menyimpan seluruh daftar Quick_Link ke Local_Storage.
4. WHEN pengguna mengklik Quick_Link, THE Quick_Links SHALL membuka URL tujuan di tab baru browser.
5. IF pengguna mencoba menambahkan Quick_Link dengan label kosong, URL kosong, atau URL yang tidak mengandung karakter titik setelah normalisasi protokol, THEN THE Quick_Links SHALL menampilkan pesan kesalahan yang mengindikasikan field mana yang tidak valid dan tidak menambahkan Quick_Link tersebut.
6. IF URL yang dimasukkan pengguna tidak diawali dengan "http://" atau "https://", THEN THE Quick_Links SHALL secara otomatis menambahkan awalan "https://" sebelum menyimpan URL.
7. THE Quick_Links SHALL mencegah pengguna memasukkan lebih dari 30 karakter pada kolom input label dengan membatasi input pada karakter ke-30.
8. THE Quick_Links SHALL menyediakan mekanisme bagi pengguna untuk menghapus Quick_Link yang sudah ada.
9. WHEN pengguna menghapus Quick_Link, THE Quick_Links SHALL menghilangkan Quick_Link tersebut dari tampilan dan THE Dashboard SHALL memperbarui Local_Storage.
10. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya, THE Quick_Links SHALL memuat dan menampilkan seluruh Quick_Link dari Local_Storage.
11. IF jumlah Quick_Link yang tersimpan sudah mencapai 20, THEN THE Quick_Links SHALL menampilkan pesan yang mengindikasikan batas maksimum tercapai dan menonaktifkan kemampuan untuk menambahkan Quick_Link baru.
12. IF Local_Storage tidak tersedia atau operasi penyimpanan gagal, THEN THE Dashboard SHALL menampilkan pesan kesalahan yang mengindikasikan bahwa data Quick_Link tidak dapat disimpan.

---

### Requirement 7: Tema Terang dan Gelap (Light/Dark Mode)

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara tema terang dan gelap, sehingga tampilan dashboard nyaman digunakan dalam berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE Theme_Manager SHALL menyediakan tombol toggle yang selalu terlihat di area header atau navigasi utama Dashboard untuk beralih antara tema `light` dan `dark`.
2. WHEN pengguna mengaktifkan tema `dark`, THE Theme_Manager SHALL mengubah skema warna seluruh antarmuka Dashboard menjadi palet warna gelap dengan rasio kontras minimum 4.5:1 antara teks dan latar belakang, dalam waktu kurang dari 200ms.
3. WHEN pengguna mengaktifkan tema `light`, THE Theme_Manager SHALL mengubah skema warna seluruh antarmuka Dashboard menjadi palet warna terang dengan rasio kontras minimum 4.5:1 antara teks dan latar belakang, dalam waktu kurang dari 200ms.
4. WHEN pengguna beralih tema, THE Dashboard SHALL menyimpan preferensi tema yang dipilih ke Local_Storage.
5. IF operasi penyimpanan preferensi tema ke Local_Storage gagal, THEN THE Theme_Manager SHALL tetap menerapkan tema yang dipilih untuk sesi saat ini tanpa menampilkan pesan kesalahan yang mengganggu alur pengguna.
6. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya, THE Theme_Manager SHALL memuat preferensi tema dari Local_Storage dan menerapkannya sebelum render konten pertama sehingga tidak ada kedipan tampilan (flash of wrong theme) yang terlihat.
7. IF Local_Storage tidak memiliki data preferensi tema, THEN THE Theme_Manager SHALL menerapkan tema `dark` sebagai tema default.

---

### Requirement 8: Persistensi Data dengan Local Storage

**User Story:** Sebagai pengguna, saya ingin semua pengaturan dan data saya tersimpan secara otomatis, sehingga saya tidak kehilangan data ketika menutup atau menyegarkan browser.

#### Acceptance Criteria

1. WHEN terjadi perubahan pada Nama_Pengguna, penambahan/penghapusan/perubahan status Task, penambahan/penghapusan Quick_Link, peralihan tema, atau perubahan durasi Pomodoro, THE Dashboard SHALL menyimpan data yang berubah ke Local_Storage sebelum memperbarui tampilan kepada pengguna.
2. WHEN pengguna memuat ulang (refresh) halaman Dashboard, THE Dashboard SHALL memuat kembali semua data dari Local_Storage sehingga: status selesai/belum selesai setiap Task dipertahankan, URL dan label Quick_Link ditampilkan kembali, tema yang dipilih diterapkan, dan durasi Pomodoro kustom digunakan sebagai durasi awal sesi baru (bukan melanjutkan sesi timer yang sedang berjalan).
3. IF Local_Storage tidak dapat diakses karena browser tidak mendukung atau pengguna menonaktifkan Local_Storage, THEN THE Dashboard SHALL menampilkan pesan pemberitahuan yang menjelaskan bahwa fitur penyimpanan data tidak tersedia dan aplikasi akan berjalan menggunakan penyimpanan sementara di memori selama sesi berlangsung.
4. THE Dashboard SHALL menggunakan kunci (key) yang konsisten dan unik untuk setiap jenis data di Local_Storage agar tidak terjadi konflik dengan data dari aplikasi atau ekstensi lain.
5. WHEN pengguna membuka Dashboard kembali setelah sesi sebelumnya di mana Focus_Timer sedang berjalan atau dijeda, THE Dashboard SHALL memuat ulang Focus_Timer dalam kondisi berhenti (tidak aktif) dengan durasi dikonfigurasi ke nilai terakhir yang tersimpan.

---

### Requirement 9: Kompatibilitas Browser dan Aksesibilitas Antarmuka

**User Story:** Sebagai pengguna, saya ingin dashboard berfungsi dengan baik di berbagai browser modern dan mudah digunakan, sehingga saya dapat mengaksesnya dari perangkat apa pun tanpa hambatan.

#### Acceptance Criteria

1. THE Dashboard SHALL berfungsi penuh pada dua versi mayor terbaru Chrome, Firefox, Edge, dan Safari tanpa error JavaScript atau kerusakan tampilan CSS.
2. THE Dashboard SHALL memiliki tampilan yang responsif sehingga semua widget dapat ditampilkan tanpa pemotongan konten atau overflow horizontal yang tidak disengaja pada lebar layar 320 piksel hingga 2560 piksel.
3. WHEN pengguna membuka Dashboard pada koneksi broadband minimum 10 Mbps, THE Dashboard SHALL merender seluruh konten awal dalam waktu kurang dari 2 detik.
4. THE Dashboard SHALL memastikan semua elemen interaktif (tombol, input, tautan) dapat dioperasikan menggunakan navigasi keyboard (Tab, Enter, Space, Escape), dan elemen yang sedang difokus memiliki indikator fokus yang terlihat secara visual.
5. THE Dashboard SHALL menggunakan elemen HTML semantik yang sesuai fungsinya — tombol menggunakan `<button>`, kolom isian menggunakan `<input>` dengan `<label>` terkait, area navigasi menggunakan `<nav>`, dan konten utama menggunakan `<main>` — untuk mendukung aksesibilitas pembaca layar (screen reader).
6. THE Dashboard SHALL memastikan rasio kontras warna antara teks dan latar belakang memenuhi standar WCAG 2.1 Level AA (minimum 4.5:1 untuk teks normal berukuran di bawah 18pt, dan minimum 3:1 untuk teks besar berukuran 18pt ke atas atau 14pt tebal) pada kedua tema terang dan gelap.

---

### Requirement 10: Struktur Kode dan Deployment

**User Story:** Sebagai pengembang, saya ingin kode proyek terstruktur dengan jelas dan dapat di-deploy ke GitHub Pages, sehingga proyek mudah dipelihara dan dapat diakses secara publik.

#### Acceptance Criteria

1. THE Dashboard SHALL mengorganisasi file proyek dengan tepat satu file CSS di dalam folder `css/` dan tepat satu file JavaScript di dalam folder `js/`.
2. THE Dashboard SHALL menggunakan satu file `index.html` sebagai titik masuk utama aplikasi.
3. WHEN pengguna membuka file `index.html` langsung di browser tanpa server lokal, THE Dashboard SHALL menampilkan semua widget tanpa error kritis di konsol browser.
4. WHEN file proyek di-push ke branch `main` atau `gh-pages` dan GitHub Pages dikonfigurasi pada branch tersebut, THE Dashboard SHALL dapat diakses melalui URL GitHub Pages dan menampilkan semua widget tanpa error kritis di konsol browser.
5. THE Dashboard SHALL tidak memiliki ketergantungan pada server backend, API eksternal berbayar, atau layanan pihak ketiga yang memerlukan autentikasi sehingga seluruh widget dapat menampilkan data dan berinteraksi dengan pengguna tanpa login atau konfigurasi kredensial.

---

## Ringkasan Batasan Teknis

| Kategori | Batasan |
|---|---|
| TC-1: Technology Stack | HTML, CSS, Vanilla JavaScript — tanpa framework |
| TC-2: Data Storage | Browser Local Storage API — sisi klien saja |
| TC-3: Browser Compatibility | Chrome, Firefox, Edge, Safari (versi modern) |
| NFR-1: Usability | Antarmuka bersih, minimal, mudah dipahami |
| NFR-2: Performance | UI responsif, render awal < 2 detik, tidak ada lag |
| NFR-3: Design | Hierarki visual jelas, tipografi mudah dibaca |
