// Libraries Required
const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

// Constant Paths
function compileContracts() {
  const contractsPath = path.resolve(__dirname, "contracts");
  const buildPath = path.resolve(__dirname, "build");

  // Contract Files
  const contractFiles = fs.readdirSync(contractsPath);
  // Remove the Build Folder
  removePath(buildPath);
  // Create the sources object
  let sources = createSources(contractFiles, contractsPath);
  // Create the input for the compiler
  const input = {
    language: "Solidity",
    sources: sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  // Compile the Contract
  const compiledContracts = JSON.parse(solc.compile(JSON.stringify(input)));

  if (compiledContracts.errors) {
    for (const error of compiledContracts.errors) {
      if (error.severity == "error") {
        console.log(error);
        return;
      }
    }
  }

  fs.ensureDirSync(buildPath);
  contractFiles.map((fileName) => {
    const contracts = Object.keys(compiledContracts.contracts[fileName]);
    contracts.map((contract) => {
      fs.outputJsonSync(
        path.resolve(buildPath, contract + ".json"),
        compiledContracts.contracts[fileName][contract]
      );
    });
  });

  console.log("compiled files successfully!");
}

function createSources(contractFiles, contractsPath) {
  const sources = {};

  for (const contractFile of contractFiles) {
    sources[contractFile] = {
      content: fs.readFileSync(
        path.resolve(contractsPath, contractFile),
        "utf8"
      ),
    };
  }

  return sources;
}

function removePath(path) {
  fs.removeSync(path); // clear the build folder
}

compileContracts();
