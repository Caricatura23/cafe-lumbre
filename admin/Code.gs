/* ============================================================
   Google Apps Script — "carta en vivo" de la plantilla
   Convierte un Google Sheet en el JSON que lee el sitio.

   CÓMO USARLO (una sola vez por cliente):
   1) En Google Sheets crea una hoja con dos pestañas:
      - "Config":  clave | valor
                   open        | si
                   showPrices  | si
                   horario     | 8:00 a 22:00, de lunes a domingo
                   nota        | Pedidos fuera de horario se atienden al abrir.
      - "Carta":  name | tag | desc | price | img | available
             (mismo orden que el ejemplo del final de este archivo)
   2) Menú: Extensiones → Apps Script → pega este archivo → Guarda.
   3) Implementar → Nueva implementación → "Aplicación web":
      - "Quién tiene acceso": Cualquier persona
      - Copia la URL (termina en /exec) y pégala en js/app.js → SHEET_URL
   4) Comparte la hoja (botón Compartir) con el dueño como Editor.
      El dueño edita las celdas y el sitio se actualiza solo.
   ============================================================ */

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = readConfig(ss);
  var items = readItems(ss);

  var out = {
    nombre: ss.getName(),
    open: cfg.open,
    showPrices: cfg.showPrices,
    horario: cfg.horario,
    nota: cfg.nota,
    items: items
  };

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeBool(v) {
  if (v === undefined || v === null) return true;
  var s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'si' || s === 'sí' || s === '1' || s === 'x';
}

function readConfig(ss) {
  var sh = ss.getSheetByName('Config');
  var out = { open: true, showPrices: true, horario: '', nota: '' };
  if (!sh) return out;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0] || '').trim().toLowerCase();
    var v = data[i][1];
    if (!k) continue;
    if (k === 'open') out.open = normalizeBool(v);
    else if (k === 'showprices') out.showPrices = normalizeBool(v);
    else if (k === 'horario') out.horario = String(v || '');
    else if (k === 'nota') out.nota = String(v || '');
  }
  return out;
}

function readItems(ss) {
  var sh = ss.getSheetByName('Carta');
  var out = [];
  if (!sh) return out;
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return out;
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (!name) continue;
    var price = Number(data[i][3]) || 0;
    out.push({
      name: name,
      tag: String(data[i][1] || ''),
      desc: String(data[i][2] || ''),
      price: price > 0 ? price : null,
      img: String(data[i][4] || ''),
      available: normalizeBool(data[i][5])
    });
  }
  return out;
}

function example() {
  // [A] Pestaña "Config"
  // [B] Pestaña "Carta" (fila 1 = encabezados)
  // name              tag               desc                         price  img                                        available
  // Espresso doble    Espresso          Café de Chiapas              55      https://…                                si
  // Latte de lavanda  Firma de la casa  Doble shot + lavanda         85      https://…                                si
  // Croissant         Panadería         Hojaldre de la casa          65      https://…                                no
}