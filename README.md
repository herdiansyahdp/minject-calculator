# Kalkulator Web / Web Calculator

Kalkulator berbasis web ringan yang mendukung ekspresi matematika lengkap dengan kurung, pangkat, dan akar kuadrat. Dibuat tanpa framework dan tanpa build tool.

## Fitur

| Fitur | Keterangan |
|-------|-----------|
| Operasi dasar | `+` `−` `×` `÷` dengan urutan operasi (precedence) yang benar |
| Kurung | Didukung, termasuk bersarang |
| Pangkat | `x^y`, right-associative: `2^3^2 = 512` |
| Akar kuadrat | `√x` |
| Bilangan desimal & negatif | `.` dan `-` unary |
| Perkalian implisit | `2(3+4) = 14` |
| Riwayat | 50 entri terakhir, tersimpan di localStorage |
| Dark/Light mode | Toggle, pilihan tersimpan |
| Keyboard penuh | `0-9`, `+ - * / ^ ( )`, `Enter`/`=` untuk hitung, `Backspace`, `Escape` |
| Penanganan error | Bagi nol, akar negatif, kurung tidak seimbang, ekspresi kosong |

## Cara Menjalankan

Tidak perlu build tool. Cukup buka `index.html` di browser:

```bash
# Contoh menggunakan Python HTTP server (agar ES Modules bekerja):
python -m http.server 8080
# lalu buka http://localhost:8080
```

> **Catatan:** ES Modules memerlukan HTTP server (tidak bisa dibuka langsung via `file://` di beberapa browser). Gunakan Live Server di VS Code atau server sederhana seperti di atas.

## Cara Menjalankan Test

```bash
npm install
npm test
```

Semua unit test berada di folder `tests/` dan mencakup:
- Lexer (tokenisasi ekspresi)
- Parser (AST recursive descent)
- Evaluator (kalkulasi + error handling)
- Formatter (presisi 10 digit signifikan)
- Calculator facade (integrasi end-to-end)
- History manager
- Input validator

## Tech Stack

- **Vanilla JavaScript (ES Modules)** — tanpa framework, tanpa bundler
- **Jest** — unit testing (devDependency saja)

## Keputusan Desain

| Keputusan | Pilihan |
|-----------|---------|
| Bahasa UI | Bilingual (Indonesia / Inggris) |
| Penyimpanan | `localStorage` (riwayat + tema) |
| Batas riwayat | 50 item |
| Klik riwayat | Memasukkan **hasil** ke input |
| Presisi tampilan | 10 digit signifikan |
| Operator ganda | Ditolak / diabaikan |
| Perkalian implisit | `2(3+4)` = `2 × (3+4)` |
| `eval()` | **Dilarang** — menggunakan parser sendiri (lexer → AST → evaluator) |

## Struktur Folder

```
minject-calculator/
├── index.html          # Entry point
├── src/
│   ├── calc/
│   │   ├── lexer.js        # Tokenizer
│   │   ├── parser.js       # Recursive descent parser → AST
│   │   ├── evaluator.js    # AST walker
│   │   ├── calculator.js   # Facade: tokenize→parse→evaluate→format
│   │   └── index.js        # Barrel exports
│   ├── ui/
│   │   ├── app.js          # UI controller (DOM wiring)
│   │   ├── history.js      # History manager
│   │   ├── inputValidator.js # Input guard (pre-typing)
│   │   └── theme.js        # Dark/light mode
│   └── utils/
│       └── format.js       # Number formatter
├── tests/              # Unit tests (mirrors src/)
├── docs/superpowers/   # Implementation plan
└── README.md
```
