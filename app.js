const types = {
  length: { label: 'pituus', units: [
    ['Millimetri', 'mm', .001], ['Senttimetri', 'cm', .01], ['Desimetri', 'dm', .1], ['Metri', 'm', 1], ['Dekametri', 'dam', 10], ['Hehtometri', 'hm', 100], ['Kilometri', 'km', 1000]
  ]},
  area: { label: 'pinta-ala', units: [
    ['Neliömillimetri', 'mm²', .000001], ['Neliösenttimetri', 'cm²', .0001], ['Neliödesimetri', 'dm²', .01], ['Neliömetri', 'm²', 1], ['Aari', 'a', 100], ['Hehtaari', 'ha', 10000], ['Neliökilometri', 'km²', 1000000]
  ]},
  volume: { label: 'tilavuus', units: [
    ['Millilitra', 'ml', .001], ['Senttilitra', 'cl', .01], ['Desilitra', 'dl', .1], ['Litra', 'l', 1], ['Kuutiodesimetri', 'dm³', 1], ['Hekto­litra', 'hl', 100], ['Kuutiometri', 'm³', 1000]
  ]}
};

let currentType = 'length';
const fromValue = document.querySelector('#fromValue');
const fromUnit = document.querySelector('#fromUnit');
const toUnit = document.querySelector('#toUnit');
const resultValue = document.querySelector('#resultValue');
const table = document.querySelector('#conversionTable');

function parseNumber(value) { return Number(String(value).replace(/\s/g, '').replace(',', '.')); }
function formatNumber(value) {
  if (!Number.isFinite(value)) return '–';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e9 || abs < 1e-6) return value.toExponential(4).replace('.', ',');
  return new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 8 }).format(value);
}
function optionMarkup(unit, i) { return `<option value="${i}">${unit[1]} – ${unit[0].toLowerCase()}</option>`; }
function setupUnits() {
  const units = types[currentType].units;
  fromUnit.innerHTML = units.map(optionMarkup).join('');
  toUnit.innerHTML = units.map(optionMarkup).join('');
  fromUnit.value = currentType === 'length' ? 3 : currentType === 'area' ? 3 : 3;
  toUnit.value = currentType === 'length' ? 1 : currentType === 'area' ? 1 : 0;
  update();
}
function update() {
  const units = types[currentType].units;
  const value = parseNumber(fromValue.value);
  const source = units[fromUnit.value];
  const target = units[toUnit.value];
  const baseValue = value * source[2];
  const result = baseValue / target[2];
  resultValue.textContent = formatNumber(result);
  document.querySelector('#conversionHint').innerHTML = Number.isFinite(value)
    ? `<span>${formatNumber(value)} ${source[1]}</span> = <strong>${formatNumber(result)} ${target[1]}</strong>` : 'Kirjoita kelvollinen luku.';
  document.querySelector('#tableValue').textContent = Number.isFinite(value) ? formatNumber(value) : '–';
  document.querySelector('#tableUnit').textContent = source[0].toLowerCase();
  table.innerHTML = units.map(unit => `<tr><td>${unit[0]}</td><td>${unit[1]}</td><td>${formatNumber(baseValue / unit[2])}</td></tr>`).join('');
}
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); currentType = tab.dataset.type; setupUnits();
}));
[fromValue, fromUnit, toUnit].forEach(element => element.addEventListener('input', update));
document.querySelector('#swapButton').addEventListener('click', () => {
  const oldFrom = fromUnit.value; fromUnit.value = toUnit.value; toUnit.value = oldFrom;
  const oldResult = resultValue.textContent; fromValue.value = oldResult.replace(/\s/g, ''); update();
});

let quiz = {}, correct = 0, attempts = 0;
function newQuestion() {
  const typeKeys = Object.keys(types), type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
  const units = types[type].units;
  let from = Math.floor(Math.random() * units.length), to = Math.floor(Math.random() * units.length);
  while (to === from) to = Math.floor(Math.random() * units.length);
  const values = [2, 3, 4, 5, 10, 12, 25, .5, 1.5, 3.5];
  const value = values[Math.floor(Math.random() * values.length)];
  quiz = { answer: value * units[from][2] / units[to][2] };
  document.querySelector('#question').textContent = `Muunna ${formatNumber(value)} ${units[from][0].toLowerCase()}a ${units[to][0].toLowerCase()}iksi.`;
  document.querySelector('#answerUnit').textContent = units[to][1];
  document.querySelector('#quizAnswer').value = '';
  document.querySelector('#feedback').textContent = '';
  document.querySelector('#feedback').className = 'feedback';
}
document.querySelector('#newQuestion').addEventListener('click', newQuestion);
document.querySelector('#checkAnswer').addEventListener('click', () => {
  const given = parseNumber(document.querySelector('#quizAnswer').value), feedback = document.querySelector('#feedback');
  if (!Number.isFinite(given)) { feedback.textContent = 'Kirjoita ensin vastaus.'; feedback.className = 'feedback wrong'; return; }
  attempts++;
  const isCorrect = Math.abs(given - quiz.answer) <= Math.max(1e-9, Math.abs(quiz.answer) * 1e-8);
  if (isCorrect) { correct++; feedback.textContent = 'Oikein! Hienosti ratkaistu.'; feedback.className = 'feedback correct'; }
  else { feedback.textContent = `Ei aivan. Oikea vastaus on ${formatNumber(quiz.answer)}.`; feedback.className = 'feedback wrong'; }
  document.querySelector('#score').textContent = `${correct} / ${attempts}`;
});
document.querySelector('#quizAnswer').addEventListener('keydown', event => { if (event.key === 'Enter') document.querySelector('#checkAnswer').click(); });
setupUnits(); newQuestion();
