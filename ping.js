var tcpp = require('tcp-ping');
const { promisify } = require('util');
const tcpp_probe = promisify(tcpp.probe);
const cliProgress = require('cli-progress');

async function ping(arr) {
    const dataCheck = [];
    const dataIPClose = [];
    console.log("\n====== Bắt đầu ping =======");
    const barProgress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    barProgress.start(arr.length, 0);
    process.stdout.write("\r\r");
    for (const element of arr) {
        try {
            const available = await tcpp_probe(element['Địa chỉ'], element.PORT);
            dataCheck.push({ ...element, 'Trạng Thái': available ? 'OPEN' : 'CLOSE' });
            if (!available) {
                dataIPClose.push({ ...element, 'Trạng Thái': 'CLOSE' });
            }
            process.stdout.write("\r");
            barProgress.increment();
        } catch (error) {
            // console.error("Dòng dữ liệu không hợp lệ");
            continue;
        }
    }
    process.stdout.write("\r");
    barProgress.increment();
    barProgress.stop();
    console.log("====== Hoàn thành ping =======\n");

    return {
        dataCheck,
        dataIPClose,
    }
}

module.exports = ping;