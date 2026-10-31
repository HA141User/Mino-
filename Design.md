Dokumen: Design Direction & UI/UX Guidelines
Versi: 0.1
Status: Konsep awal
Target utama: Desktop terlebih dahulu, dengan dukungan responsif
untuk mobile
Referensi inti: UnicodeGames dan Coolmath Games
Nama kerja: littleplay. --- nama sementara, belum final
1. Ringkasan Proyek
Proyek ini adalah portal untuk memainkan game-game sederhana yang dibuat
sendiri dan akan terus bertambah seiring pengembangan. Contoh game awal:
- Snake
- Sudoku
- Tic-Tac-Toe
- Minesweeper
- Game arcade, puzzle, strategi, dan game kasual lain pada tahap
  berikutnya
Website harus memudahkan pengunjung menemukan game dan mulai bermain
tanpa banyak langkah. Platform perlu memiliki identitas visual yang
kuat, katalog yang mudah dikembangkan, serta pengalaman bermain yang
ringan.
Tujuan desain
1. Membuat portal game yang minimalis, hangat, dan terasa orisinal.
2. Menggabungkan kesederhanaan antarmuka ala UnicodeGames dengan
   kemudahan menjelajahi katalog ala Coolmath Games.
3. Menghindari tampilan generik yang terasa seperti template AI.
4. Menjaga konsistensi visual meskipun jumlah game bertambah.
5. Mengutamakan keterbacaan, performa, aksesibilitas, dan kemudahan
   penggunaan.
Prinsip inti
- Minimal in chrome, rich in play. Antarmuka sederhana, pengalaman
  bermain tetap menarik.
- One brand, many personalities. Satu identitas platform, tetapi
  setiap game boleh memiliki ekspresi visualnya sendiri.
- Built with intention, not templates. Setiap elemen harus
  memiliki tujuan, bukan sekadar mengikuti tren UI.
- Find a game, start playing. Penemuan game dan akses ke permainan
  harus cepat.
2. Referensi dan Cara Menggunakannya
A. UnicodeGames
URL: https://unicodegames.com/

Gunakan sebagai referensi untuk:
- Minimalisme dan fokus pada fungsi.
- Penggunaan simbol, teks, atau bentuk sederhana sebagai elemen
  visual.
- Antarmuka yang tidak dipenuhi dekorasi.
- Pengalaman langsung menuju permainan.
Jangan menyalin secara langsung: identitas visual, susunan halaman,
aset, atau elemen khasnya. Ambil prinsip kesederhanaan dan fokusnya.
B. Coolmath Games
URL: https://www.coolmathgames.com/\
Halaman kategori: https://www.coolmathgames.com/categories

Gunakan sebagai referensi untuk:
- Struktur katalog game.
- Pengelompokan berdasarkan kategori.
- Penemuan game melalui card, filter, dan pencarian.
- Bagian game pilihan, game baru, dan rekomendasi.
- Kejelasan informasi pada kartu game.
Jangan menyalin secara langsung: gaya visual, ilustrasi, aset, atau
tata letak khasnya. Ambil logika katalog dan kemudahan navigasinya.
C. Referensi eksplorasi tambahan
- Awwwards --- https://www.awwwards.com/\
  Untuk eksplorasi desain web yang kreatif dan berani.
- SiteInspire --- https://www.siteinspire.com/\
  Untuk layout editorial, portofolio, dan website yang terkurasi.
- Land-book --- https://land-book.com/\
  Untuk referensi struktur landing page.
- Behance --- https://www.behance.net/\
  Untuk studi kasus, branding, dan konsep art direction.
- The FWA --- https://thefwa.com/\
  Untuk pengalaman web eksperimental dan interaktif.
- Recent --- https://recent.design/\
  Untuk inspirasi desain digital kontemporer.
Referensi tambahan digunakan untuk memperluas pilihan, bukan mengganti
arah desain utama.
3. Arah Visual: Warm Minimalist Arcade
Karakter yang ingin dicapai
- Hangat, bersahaja, dan ramah.
- Minimalis tetapi tidak terasa kosong.
- Terstruktur, namun tidak kaku.
- Berkarakter tanpa dekorasi berlebihan.
- Terasa dibuat dengan sengaja, bukan hasil template generik.
- Berfokus pada game dan kemudahan eksplorasi.
Hal yang perlu dihindari
- Hero dengan gradasi ungu-biru generik.
- Glassmorphism sebagai dekorasi utama.
- Bayangan tebal pada semua kartu.
- Radius yang terlalu besar dan seragam pada semua elemen.
- Terlalu banyak badge, pill, dan panel dekoratif.
- Animasi berlebihan atau gerakan yang tidak membantu pengguna.
- Ilustrasi stok generik yang sama pada semua game.
- Menjejalkan terlalu banyak section ketika jumlah game masih sedikit.
- Menggunakan terlalu banyak font atau warna aksen tanpa alasan.
Palet warna awal
Palet ini merupakan usulan awal dan dapat disesuaikan setelah uji
kontras serta pengujian visual.

  Token                 Nilai       Kegunaan
  --color-paper       #F4F1E9   Latar utama
  --color-surface     #FBF9F4   Permukaan kartu atau input
  --color-ink         #282923   Teks utama
  --color-muted       #6B6B62   Teks sekunder
  --color-border      #DAD5C9   Garis pembatas
  --color-sage        #DCE5D0   Aksen ilustrasi arcade
  --color-clay        #EBD8CA   Aksen ilustrasi puzzle
  --color-blue-gray   #DDE5E9   Aksen ilustrasi strategi
  --color-lilac       #E7DFEF   Aksen ilustrasi game tambahan

Gunakan paper dan ink sebagai fondasi. Warna pastel dipakai terutama
pada area ilustrasi game, bukan sebagai latar berwarna untuk seluruh
halaman.
Tipografi
Rekomendasi awal:
- Font utama: Manrope atau Plus Jakarta Sans.
- Font monospace: IBM Plex Mono untuk skor, timer, angka teknis,
  atau label tertentu.
Aturan:
- Pilih satu font sans-serif utama untuk seluruh antarmuka.
- Gunakan monospace secara terbatas dan fungsional.
- Prioritaskan keterbacaan, hierarki, dan konsistensi.
- Hindari penggunaan terlalu banyak bobot font.
- Pastikan font mendukung karakter dan angka yang diperlukan.
4. Design Tokens dan Layout
Nilai berikut adalah titik awal untuk implementasi desktop.

  Token                   Nilai awal   Kegunaan
  --content-width       1200px     Lebar maksimum konten
  --page-gutter         32px       Padding horizontal desktop
  --space-section       56px       Jarak antarseksi
  --space-card          16px       Padding isi card
  --radius-card         12px       Radius kartu game
  --radius-control      8px        Radius input dan kontrol
  --border-width        1px        Border standar
  --transition-fast     160ms      Transisi interaksi singkat
  --transition-normal   220ms      Transisi antarmuka umum

Gunakan sistem spacing berbasis kelipatan 4 atau 8 piksel. Jangan
menggunakan nilai berbeda-beda tanpa alasan.
Grid desktop
- Maksimum lebar konten: sekitar 1200 px.
- Gunakan grid responsif untuk kartu game.
- Pada desktop lebar, target awal 4 kolom kartu jika ukuran layar dan
  konten mendukung.
- Pada desktop lebih sempit, gunakan 3 atau 2 kolom sesuai ruang yang
  tersedia.
- Hindari menetapkan ukuran card yang membuat judul atau informasi
  game terpotong.
- Jaga jarak antarcard konsisten, dengan jarak yang cukup untuk
  membedakan item.
Breakpoint final ditetapkan setelah mockup diuji pada beberapa lebar
layar; jangan mengandalkan satu resolusi desktop saja.
5. Struktur Homepage
Urutan section yang direkomendasikan:
5.1 Navbar
Elemen:
- Logo tipografis.
- Tautan Games.
- Tautan About.
- Akses pencarian jika sesuai dengan kebutuhan layout.
Ketentuan:
- Navbar ringkas.
- Tidak perlu banyak tombol.
- Hindari membuat navbar lebih dominan daripada katalog.
- Logo dan nama brand harus mudah dibaca.
5.2 Hero
Contoh copy sementara:
Santai sejenak.
Game sederhana, dibuat dengan hati-hati. Siap kapan pun.

Hero harus memperkenalkan karakter platform dan mengarahkan pengguna ke
permainan. Hindari paragraf panjang atau slogan yang terlalu abstrak.

Ketentuan:
- Judul besar dengan tipografi kuat.
- Deskripsi singkat.
- Pencarian dapat ditempatkan di hero atau tepat di bawahnya.
- Tidak perlu ilustrasi besar jika tipografi dan katalog sudah cukup
  kuat.
- Pastikan katalog mulai terlihat tanpa pengguna harus menggulir
  terlalu jauh.
5.3 Search dan kategori
Kategori awal:
- All games
- Arcade
- Puzzle
- Strategy
- Word (opsional, saat ada cukup game)
Ketentuan:
- Pencarian harus mudah ditemukan.
- Filter kategori harus jelas dan memiliki state aktif.
- Jangan menampilkan kategori kosong.
- Pastikan pencarian bekerja dengan keyboard dan dapat diakses oleh
  pembaca layar.
5.4 Featured games / Start playing
Tampilkan 4--8 game pilihan jika katalog masih kecil.

Setiap kartu harus membantu pengguna memahami:
- Nama game.
- Jenis atau kategori.
- Karakter visual permainan.
- Aksi untuk membuka permainan.
Jangan membuat section "featured" yang tidak menambah nilai jika belum
ada cukup game untuk dipilih.
5.5 All games
- Menampilkan katalog utama.
- Mendukung pencarian dan filter.
- Menggunakan komponen card yang konsisten.
- Memiliki empty state ketika tidak ada hasil.
- Dapat dikembangkan untuk pengurutan berdasarkan nama, game terbaru,
  atau popularitas jika data tersedia.
5.6 Recently added
Bagian opsional untuk game terbaru. Tampilkan hanya jika data tanggal
rilis tersedia dan jumlah game sudah cukup.
5.7 Footer
Informasi yang dapat disertakan:
- Tentang proyek.
- Kontak atau kanal masukan.
- Kebijakan privasi jika relevan.
- Hak cipta.
- Tautan navigasi penting.
Jaga footer tetap sederhana.
6. Spesifikasi Game Card
Struktur card
1. Area ilustrasi game.
2. Nama game.
3. Kategori atau metadata singkat.
4. Indikator bahwa card dapat dibuka, jika diperlukan.
Ukuran dan tampilan awal
- Area ilustrasi: rasio sekitar 5:4 atau 4:3.
- Padding: 16–20px.
- Radius: sekitar 12px.
- Border tipis.
- Tanpa bayangan tebal sebagai gaya default.
- Judul: sekitar 18–22px, medium atau semibold.
- Metadata: sekitar 11–12px, dengan kontras yang tetap terbaca.
Interaksi
- Seluruh card dapat diklik jika tidak mengganggu kontrol lain di
  dalamnya.
- Hover dapat menggeser panah beberapa piksel atau memberi perubahan
  warna yang halus.
- Focus keyboard harus terlihat jelas.
- Gunakan target interaksi yang cukup besar.
- Hormati preferensi prefers-reduced-motion.
- Jangan menggunakan animasi yang menyebabkan layout bergeser atau
  mengganggu pembacaan.
Variasi ilustrasi berdasarkan game
  Game                                Ide ilustrasi
  Snake                               Grid dan bentuk ular geometris

  Sudoku                              Grid angka dengan satu atau
                                      beberapa sel beraksen

  Tic-Tac-Toe                         Simbol X dan O pada grid

  Minesweeper                         Grid kotak, angka, dan simbol
                                      ranjau

  Game tambahan                       Bentuk, simbol, atau ilustrasi
                                  khusus sesuai mekanik game
Ilustrasi dapat dibuat dengan SVG atau CSS jika sesuai. Gunakan aset
orisinal dan hindari menyalin ilustrasi atau aset dari situs referensi.

Prinsip: satu identitas platform, tetapi setiap game memiliki
ekspresi visualnya sendiri.
7. Arsitektur Informasi dan Halaman
Halaman yang direncanakan:
1. / --- Homepage.
2. /games --- Katalog seluruh game.
3. /games/arcade --- Kategori arcade.
4. /games/puzzle --- Kategori puzzle.
5. /games/strategy --- Kategori strategi.
6. /games/[slug] --- Halaman permainan.
7. /about --- Tentang proyek.
Rute kategori tambahan hanya dibuat ketika kategori tersebut benar-benar
memiliki konten yang memadai.
Halaman permainan
Area permainan harus menjadi fokus utama. Komponen yang mungkin
diperlukan:
- Judul dan deskripsi singkat.
- Area gameplay.
- Kontrol atau instruksi.
- Skor dan timer jika relevan.
- Tombol restart atau new game.
- Pengaturan tingkat kesulitan jika tersedia.
- Game terkait atau rekomendasi setelah area permainan.
Jangan membebani halaman game dengan dekorasi, panel, atau rekomendasi
yang mengganggu permainan.
8. Sistem Data Game
Gunakan satu registry atau sumber data terstruktur untuk mengelola
katalog. Homepage, kategori, pencarian, dan halaman game harus membaca
sumber data yang konsisten.

Contoh tipe data awal:
type GameCategory = "arcade" | "puzzle" | "strategy";

type Game = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: GameCategory;
  featured: boolean;
  releaseDate: string;
  thumbnail: string;
  path: string;
};
Catatan:
- slug digunakan untuk URL yang stabil.
- category sebaiknya menggunakan nilai yang konsisten.
- featured menentukan apakah game muncul di bagian pilihan.
- releaseDate dipakai untuk mengurutkan game terbaru.
- thumbnail menunjuk ke ilustrasi yang dimiliki atau boleh digunakan
  proyek.
- path menunjuk ke rute atau entry point permainan.
Sesuaikan tipe data ketika kebutuhan seperti tingkat kesulitan, kontrol,
durasi rata-rata, atau status publikasi sudah jelas. Jangan menambahkan
field hanya untuk berjaga-jaga tanpa kebutuhan nyata.
9. Prinsip Implementasi Teknis
Pemisahan komponen
Komponen bersama dapat mencakup:
- Navbar
- SearchBar
- CategoryFilter
- GameCard
- GameGrid
- SectionHeading
- EmptyState
- Footer
Logika gameplay setiap game tetap terpisah dari komponen katalog dan
design system.
Performa
- Gunakan SVG atau CSS untuk ilustrasi sederhana.
- Hindari memuat seluruh kode gameplay ketika homepage dibuka.
- Pertimbangkan lazy loading atau code splitting untuk game yang tidak
  sedang dimainkan.
- Hindari animasi berat yang tidak memberi manfaat pada pengalaman
  pengguna.
- Periksa ukuran aset dan performa pada perangkat yang ditargetkan.
Aksesibilitas
- Semua kontrol penting dapat digunakan dengan keyboard.
- Gunakan focus indicator yang terlihat.
- Pastikan kontras teks memadai.
- Jangan mengandalkan warna saja untuk menyampaikan status.
- Berikan label yang jelas pada tombol dan input.
- Hormati preferensi pengurangan gerakan.
- Sediakan instruksi kontrol yang mudah ditemukan di setiap game.
Penyimpanan lokal
Skor terbaik atau preferensi sederhana dapat disimpan secara lokal bila
sesuai. Jangan menganggap penyimpanan lokal sebagai pengganti backend
untuk fitur yang memerlukan sinkronisasi lintas perangkat atau akun.
10. Aturan Anti-Generik
"Anti-AI" dalam dokumen ini berarti menghindari hasil desain yang terasa
generik dan seragam, bukan sekadar menghindari penggunaan alat AI.
Lakukan
- Buat ilustrasi yang berhubungan langsung dengan mekanik setiap game.
- Gunakan copywriting yang spesifik dan alami.
- Tentukan alasan di balik setiap pilihan warna, ukuran, dan
  komposisi.
- Gunakan ruang kosong untuk membangun hierarki, bukan sekadar
  memenuhi tren minimalisme.
- Berikan detail interaksi kecil yang konsisten.
- Pastikan visual merepresentasikan karakter game dan identitas
  platform.
- Uji desain dengan game sungguhan, bukan hanya placeholder.
Hindari
- Meniru template landing page generik.
- Menggunakan gradasi, blur, dan glassmorphism tanpa tujuan.
- Menambahkan banyak kartu statistik atau badge yang tidak relevan.
- Memakai ilustrasi stok yang sama untuk semua game.
- Membuat semua elemen membulat dan berbayang secara berlebihan.
- Menggunakan animasi hanya agar halaman terlihat "modern".
- Menyalin aset, kode, atau identitas khas website referensi.
11. Roadmap Pengembangan
Tahap 1 --- Finalisasi visual
- Tentukan nama brand final.
- Finalisasi palet warna dan tipografi.
- Tentukan grid desktop dan aturan spacing.
- Rancang komponen card dan ilustrasi.
Tahap 2 --- Homepage dan katalog
- Implementasikan navbar dan hero.
- Implementasikan search dan filter kategori.
- Implementasikan card dan grid game.
- Siapkan empty state dan tampilan ketika hasil pencarian sedikit.
Tahap 3 --- Game pilot
Mulai dengan Snake untuk menguji integrasi katalog, rute permainan,
kontrol keyboard, skor, dan restart.
Tahap 4 --- Tambahkan permainan
Implementasikan Sudoku dan Tic-Tac-Toe dengan logika gameplay
masing-masing. Pertahankan konsistensi platform tanpa memaksa semua game
memakai UI permainan yang identik.
Tahap 5 --- Pengujian
- Uji beberapa resolusi desktop.
- Uji keyboard dan aksesibilitas.
- Uji pencarian serta filter.
- Periksa performa pemuatan.
- Uji penambahan game baru tanpa mengubah struktur homepage secara
  manual.
12. Kriteria Penerimaan Desain
Desain dapat dianggap siap untuk implementasi awal jika:
- [ ] Identitas visual terasa konsisten dan berbeda dari template
  generik.
- [ ] Pengguna dapat menemukan game melalui katalog, kategori, atau
  pencarian.
- [ ] Game card mudah dipindai dan memiliki hierarki yang jelas.
- [ ] Ilustrasi game memiliki hubungan visual dengan mekanik
  permainan.
- [ ] Layout tetap baik pada beberapa lebar desktop.
- [ ] Interaksi hover dan keyboard memiliki state yang jelas.
- [ ] Penambahan game baru tidak memerlukan pembuatan ulang seluruh
  homepage.
- [ ] Halaman permainan tetap fokus pada gameplay.
- [ ] Tidak ada aset dari situs referensi yang digunakan tanpa izin.
13. Ringkasan Keputusan Desain
  Area                    Keputusan
  Arah visual             Warm Minimalist Arcade
  Referensi minimalisme   UnicodeGames
  Referensi katalog       Coolmath Games
  Target utama            Desktop terlebih dahulu
  Responsivitas           Tetap disiapkan untuk mobile
  Latar utama             Off-white hangat
  Teks utama              Charcoal
  Aksen                   Sage, clay, dan warna lembut lain sesuai game
  Tipografi               Sans-serif utama dan monospace secara terbatas
  Game card               Ilustrasi khas, border tipis, radius moderat
  Animasi                 Ringan, fungsional, dan tidak berlebihan
  Arsitektur katalog      Satu registry data game
  Prioritas awal          Homepage, katalog, lalu game pilot
  Nama brand              Mino sebagai nama pilihan sementara; belum diverifikasi secara legal

Prinsip penutup: bangun platform yang sederhana saat dilihat, mudah
saat digunakan, dan kaya karakter ketika setiap game dimainkan.

Dokumen ini menjadi acuan awal untuk keputusan UI/UX, komponen frontend,
dan pengembangan game berikutnya. Jika arah visual berubah, revisi
dokumen ini terlebih dahulu agar implementasi tetap konsisten.
14. Identitas Brand: Mino
Nama brand
Mino adalah nama pilihan untuk portal game ini. Nama ini singkat, ramah, mudah diucapkan, dan cukup fleksibel untuk menampung berbagai jenis game orisinal—mulai dari Snake dan Sudoku hingga permainan yang akan dikembangkan di masa depan.

Status nama: pilihan konsep, belum final secara legal. Sebelum peluncuran, periksa ketersediaan domain, username media sosial, serta potensi konflik merek dagang di wilayah yang relevan.
Arah logo
Gaya yang dipilih: simbol geometris.

Logo Mino sebaiknya memiliki simbol geometris orisinal yang sederhana, mudah dikenali, dan tetap terbaca pada ukuran kecil. Simbol dapat mengeksplorasi ide:
- Grid atau susunan kotak yang terinspirasi dari permainan.
- Satu titik atau bentuk kecil sebagai elemen kejutan.
- Bentuk geometris yang menyiratkan gerakan, eksplorasi, atau interaksi.
- Negative space yang membuat simbol terasa khas tanpa menjadi rumit.
Hindari penggunaan ikon gamepad generik, joystick literal, atau simbol yang terlalu menyerupai satu game tertentu. Logo harus mewakili keseluruhan platform, bukan hanya Snake, Sudoku, atau Tic-Tac-Toe.
Wordmark
- Gunakan wordmark lowercase: mino.
- Pilih sans-serif modern dengan bentuk huruf yang hangat dan mudah dibaca.
- Jaga jarak huruf dan proporsi agar wordmark tetap jelas di navbar.
- Simbol dan wordmark harus dapat digunakan bersama maupun terpisah.
- Siapkan versi satu warna untuk penggunaan monokrom dan versi aksen untuk identitas utama.
Palet logo
Elemen	Warna	Nilai
Latar utama	Warm paper	#F4F1E9
Simbol/wordmark utama	Charcoal ink	#282923
Aksen pilihan	Sage	#DCE5D0
Aksen sekunder opsional	Clay	#EBD8CA


Logo harus tetap berfungsi dalam satu warna. Warna aksen tidak boleh menjadi satu-satunya cara untuk membedakan bagian penting simbol.
Varian logo yang perlu disiapkan
1. Primary lockup: simbol geometris + wordmark mino.
2. Symbol only: simbol untuk favicon, ikon situs, dan avatar.
3. Monochrome: versi satu warna untuk konteks terbatas.
4. Small-size version: bentuk yang disederhanakan agar tetap jelas pada ukuran 16–32 px.
Aturan penggunaan
- Jangan menambahkan gradasi, efek 3D, atau bayangan dekoratif.
- Jangan membuat simbol terlalu detail.
- Jangan mengubah proporsi simbol dan wordmark secara sembarangan.
- Sisakan ruang kosong di sekitar logo.
- Pastikan kontras memadai pada latar terang maupun gelap.
- Uji logo pada navbar desktop, favicon, dan ukuran kecil sebelum menetapkan versi final.
Status keputusan
- Nama pilihan: Mino.
- Gaya logo: simbol geometris.
- Arah visual: Warm Minimalist Arcade.
- Warna dasar: warm paper dan charcoal ink, dengan aksen sage.
- Status aset logo: belum dibuat atau difinalisasi.
Keputusan ini menjadi arah kerja untuk eksplorasi identitas visual berikutnya, bukan klaim bahwa logo final sudah tersedia.