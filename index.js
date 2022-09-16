var tcpp = require('tcp-ping');
// Requiring the module
const reader = require('xlsx')
const { promisify } = require('util');
const tcpp_probe = promisify(tcpp.probe);
const sendgrid = require('@sendgrid/mail')
const fs = require("fs");
const SENDGRID_API_KEY = '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';
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataIPClose = [];

const app = async () => {
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
        ping(data, file);

    } catch (error) {
        console.error("Không thể đọc file " + error);
    }
}


async function ping(arr, file) {
    let dataCheck = [];
    console.table("\n====== Bắt đầu ping =======");
    for (const element of arr) {
        try {
            const available = await tcpp_probe(element['Địa chỉ'], element.PORT);
            console.log(element['Địa chỉ'], element.PORT, available);
            // let data = await tcpp_ping({ address: element['Địa chỉ'], port: element.PORT });
            // console.log(data);
            dataCheck.push({ ...element, 'Trạng Thái': available ? 'OPEN' : 'CLOSE' });

            if (!available) {
                dataIPClose.push({ ...element, 'Trạng Thái': 'CLOSE' });
            }
        } catch (error) {
            console.error("Dòng dữ liệu không hợp lệ");
            continue;
        }
    }
    console.table("====== Hoàn thành ping =======\n");
    console.table(dataCheck);
    try {
        const ws = reader.utils.json_to_sheet(dataCheck)
        reader.utils.book_append_sheet(file, ws, "result");
        const today = new Date();

        const nameFile = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}_${today.getDate()}-${today.getMonth()}-${today.getFullYear()}_ip-result.xlsx`;

        reader.writeFile(file, nameFile);

        console.table(`\n Xuất file \'${nameFile}\' thành công!`);
        requestSendMail();
    } catch (error) {
        console.error("Không thể ghi file" + error);
    }

}

const sendMail = (emails) => {
    sendgrid.setApiKey(SENDGRID_API_KEY);
    let msg = {};
    if (dataIPClose.length !== 0) {
        pathToAttachment = `./ipCLosed.xlsx`;
        const attachment = fs.readFileSync(pathToAttachment).toString("base64");
        msg = {
            to: emails,
            from: 'check.ip.closed@gmail.com', // Use the email address or domain you verified above
            subject: 'Sending Mail file closed IP excel',
            /* Adding HTML and Text Version, so the email will not land up in the Spam folder */
            html: 'Hello Team! <br><br>Please find attached closed IP excel.<br><br>Thanks,<br>IP Checker ',
            text: 'Hello Team! <br><br>Please find attached closed IP excel.<br><br>Thanks,<br>IP Checker',
            attachments: [
                {
                    content: attachment,
                    filename: "ipCLosed.xlsx",
                    type: "application/xlsx",
                    disposition: "attachment"
                }
            ]
        };
    } else {
        msg = {
            to: emails,
            from: 'check.ip.closed@gmail.com', // Use the email address or domain you verified above
            subject: 'Sending Mail file closed IP excel',
            /* Adding HTML and Text Version, so the email will not land up in the Spam folder */
            html: 'Hello Team! <br><br>HÔM nay không có port nào đóng.<br><br>Thanks,<br>IP Checker ',
            text: 'Hello Team! <br><br>HÔM nay không có port nào đóng.<br><br>Thanks,<br>IP Checker',
        };
    }


    (async () => {
        try {
            await sendgrid.send(msg);
            console.log("Gửi mail thành công");
            if (dataIPClose.length !== 0) {
                fs.unlinkSync('ipCLosed.xlsx');
            }
            // console.log("File is deleted.");
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body)
            }
        }
    })();

}

const readEmails = () => {
    const emails = [];
    const allFileContents = fs.readFileSync('email.txt', 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line => {
        if (line.trim() != '') {
            emails.push(line.trim());
        }
    });
    // const used = process.memoryUsage().heapUsed / 1024 / 1024;
    // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    return emails;
}

const requestSendMail = () => {

    const emails = readEmails();
    if (emails && emails.length != 0) {
        console.table(emails);
        if (dataIPClose.length !== 0) {
            const workSheet = reader.utils.json_to_sheet(dataIPClose);
            const workBook = reader.utils.book_new();
            reader.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            reader.writeFile(workBook, "./ipCLosed.xlsx");
        }
        sendMail(emails);
        readline.question(' ', agree => {
            readline.close();
        });
    }
    else {
        readline.close();
    }
}


app();