import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="prose-page container">
      <header className="page-head">
        <p className="page-eyebrow">Tentang</p>
        <h1>Tempat yang lebih tenang untuk bermain.</h1>
        <p className="page-head__description">
          Mino adalah koleksi kecil game sederhana, dibuat satu per satu dan
          dijauhkan dari kekacauan.
        </p>
      </header>

      <div className="prose">
        <p>
          Sebagian besar situs game meminta banyak hal sebelum kamu bisa
          bermain. Akun, tutorial, deretan hal yang harus diikuti. Mino adalah
          kebalikannya: buka halaman, pilih game, dan istirahat sebentar.
        </p>

        <h2>Yang kami pegang</h2>
        <ul className="principles">
          <li>
            <strong>Minimal di permukaan, kaya saat dimainkan.</strong>
            <span>Antarmuka menyingkir agar game bisa memimpin.</span>
          </li>
          <li>
            <strong>Satu merek, banyak kepribadian.</strong>
            <span>
              Setiap game membawa karakter Mino sambil tetap punya suara
              visualnya sendiri.
            </span>
          </li>
          <li>
            <strong>Dibuat dengan sengaja.</strong>
            <span>
              Tanpa template pinjaman, tanpa dekorasi berlebihan, tanpa bagian
              pengisi.
            </span>
          </li>
          <li>
            <strong>Temukan game, mulai bermain.</strong>
            <span>Menjelajah seharusnya butuh detik, bukan menit.</span>
          </li>
        </ul>

        <h2>Kondisinya sekarang</h2>
        <p>
          Snake sudah bisa dimainkan, sementara Sudoku dan Tic-Tac-Toe sedang
          disiapkan. Katalog dibangun lebih dulu agar setiap game punya tempat
          yang rapi saat dibuka.
        </p>

        <Link to="/games" className="button">
          Jelajahi game
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
