
const ping = require('./ping');
const reader = require('xlsx');

console.log(ping);

try {
    const file = reader.readFile('./ip.xlsx')
    let data = []
    const sheets = file.SheetNames

    for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
        temp.forEach((res) => {
            data.push(res)
        })
    }
    // Printing data
    console.table(data);
    ping(data);

} catch (error) {
    console.error("Không thể đọc file " + error);
}