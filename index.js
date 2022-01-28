const { parse } = require("csv-parse");
const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const gcloudAdatpter = require("./gcloud");
const { PythonShell } = require("python-shell");

const pontos = [];
const exportPontos = [];
const categories = [];

function addCategory(category) {
  const categoryAlreadyExists = categories.find(
    (cat) => cat.id === category.id
  );

  if (!categoryAlreadyExists) {
    categories.push({
      id: category.id,
      subcategories: [],
    });
    return;
  }

  const storedCategory = categories.find((cat) => cat.id === category.id);

  const subCategoryAlreadyExists = storedCategory.subcategories.find(
    (sub) => sub.id === category.subCategory
  );

  if (!subCategoryAlreadyExists) {
    storedCategory.subcategories.push({
      id: category.subCategory,
    });
  }
}

function sortCategories() {
  categories.forEach((cat) => {
    exportPontos.push(`Pontos de ${cat.id}`);
    cat.subcategories.forEach((sub) => {
      const pontos = searchPontos(cat.id, sub.id);
      exportPontos.push(pontos);
    });
  });
}

function searchPontos(linha, ritmo) {
  const retorno = pontos
    .filter((line) => line.ritmo === ritmo && line.linha === linha)
    .map((line) => {
      exportPontos.push(`Entidade: ${line.entidade}`);
      exportPontos.push(`Toque: ${ritmo}`);
      exportPontos.push(line.letra);
      return;
    })
    .join("");

  return retorno;
}

function callScript(rows) {
  let options = {
    mode: "text",
    pythonPath: "/usr/local/bin/python3",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: "",
    args: rows,
  };

  PythonShell.run("createDocument.py", options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log("results: %j", results);
  });
}

function importFile() {
  const filePath = path.resolve("pontos.csv");

  const stream = fs.createReadStream(filePath);

  const parseFile = parse({ delimiter: ",", fromLine: 2 });
  stream.pipe(parseFile);
  parseFile
    .on("data", async (line) => {
      pontos.push({
        linha: line[0],
        entidade: line[1],
        ritmo: line[2],
        letra: line[3],
      });

      addCategory({
        id: line[0],
        subCategory: line[2],
        subcategories: [],
      });
    })
    .on("end", () => {
      sortCategories();

      // gcloudAdatpter.execute("pontos", exportPontos.join(""));
      callScript(exportPontos);
      resolve(filePath);
    })
    .on("error", (error) => {
      reject(error);
    });
}

importFile();
