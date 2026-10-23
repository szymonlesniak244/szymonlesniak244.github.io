# Strona-CV: Szymon (AI i automatyzacje)

Czysty HTML, CSS i JS, bez frameworków i bez instalowania czegokolwiek.

## Jak uruchomić lokalnie
1. Otwórz terminal w tym folderze.
2. Wpisz: `python -m http.server 8000`
3. W przeglądarce wejdź na: http://localhost:8000

## Gdzie co edytować
- **Teksty:** bezpośrednio w plikach `index.html`, `projekty.html`, `jak-pracuje.html`, `o-mnie.html`.
- **Placeholdery** to żółte pola `[TU ...]` (klasa `ph`). Po wpisaniu treści usuń `<span class="ph">`.
- **Kolory i fonty:** sekcja `:root` na górze pliku `css/style.css`.
- **Słowa w efekcie pisania:** atrybut `data-words` w `index.html`.
- **Zdjęcia projektów:** `assets/img/`, raporty PDF i CV: `assets/pdf/`.
- **Projekty** są w 2 miejscach: skrót na `index.html` i pełna wersja na `projekty.html`.
- **Poziomy umiejętności:** `jak-pracuje.html`, klasa `on` na kreskach (1–4).
- **CV (PDF):** teksty w `cv/cv.html`. Przy włączonym serwerze nowy PDF zrobisz poleceniem (PowerShell):
  `& "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe" --headless=new --no-pdf-header-footer --print-to-pdf="assets\pdf\cv-szymon-lesniak.pdf" http://localhost:8000/cv/cv.html`
