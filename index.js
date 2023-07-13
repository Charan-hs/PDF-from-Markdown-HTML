const fs = require("fs");
const path = require("path");
const showdown = require("showdown");
const puppeteer = require("puppeteer");
const { randomInt } = require("crypto");
var conversion = require("phantom-html-to-pdf")();


const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

const result = getAllFiles("sample");

converter = new showdown.Converter();

const y = `<!DOCTYPE html>
<html lang="en">
<head>
<style>
#header {
  color: red;
}
#footer {
  color: blue;
}
</style>
  <title>Document</title>
</head>
<body>`;
const x = `</body>
</html>`;
const generatePDF = async (html) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setContent(y + html + x, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("screen");
  const config = {
    path: `result.pdf`,
    // path: `result${randomInt(1000)}.pdf`,
    displayHeaderFooter: true,
    margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
    footerTemplate: `<div style="width:95%;font-size:10px;color:#f6f6f6;display: flex; justify-content: space-between; padding: 0px 10px" id="footer">
    <span >Footert</span>
    <span>
    <span class="pageNumber"></span>/<span class="totalPages"></span>
    </span>
  </div>`,
  };
  // Downlaod the PDF Name can be changed and location also
  const pdf = await page.pdf(config);
  await browser.close();
};


result.forEach((filePath) => {
  fs.readFile(filePath, { encoding: "utf-8" }, async function (err, data) {
    if (!err) {
      await generatePDF(converter.makeHtml(data));
    } else {
      console.log(err);
    }
  });
});

console.log(result);

// headerTemplate: '<div id="header-template" style="font-size:10px !important; color:#808080; padding-left:10px"><span class="date"></span><span class="title"></span><span class="url"></span><span class="pageNumber"></span><span class="totalPages"></span></div>',
//   footerTemplate: `<div id="footer" style="display: flex; justify-content: space-between; padding: 0px 10px">
//   <img width="300px" style="display: inline" src="http://localhost:5500/images/image1.png" /><div style="display: inline; padding-top: 10px"><span class="pageNumber"></span>/<span class="totalPages"></span></div></div>`,
