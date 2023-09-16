let table = document.querySelectorAll('#ctl00_ph_otd_geo_ctl00 tbody tr');
let print = [];
Array.from(table).forEach(row => {
Array.from(row.children).forEach(td => {
if (td.textContent.length > 0) {
print.push(`${td.textContent}`);
} else {
Array.from(td.children).forEach(innerTd => {
if (innerTd.value.length > 0) {
print.push(`${innerTd.value}`)
}else if (innerTd.innerText.length > 0) {
print.push(`${innerTd.innerText}`)
}
})
}
})
})
console.log(print.map(el => el.trim()).join("\n"))