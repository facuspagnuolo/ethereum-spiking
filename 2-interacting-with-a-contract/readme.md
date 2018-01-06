# Deploying instructions
1. Run `testrpc`
2. Open node console
3. `> Web3 = require('web3');`
4. `> const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));`
5. `> const solidityCompiler = require('solc');`
6. `> myTokenCode = fs.readFileSync('MyToken.sol').toString();`
7. `> compiledCode = solidityCompiler.compile(myTokenCode);`
8. `> myTokenABI = JSON.parse(compiledCode.contracts[':MyToken'].interface);`
9. `> MyTokenContract = web3.eth.contract(myTokenABI);`
10. `> myTokenByteCode = compiledCode.contracts[':MyToken'].bytecode;`
11. `> deployedContract = MyTokenContract.new({data: myTokenByteCode, from: web3.eth.accounts[0], gas: 999999});` feel free to use any account
12. `> deployedContract.address;` you will need this address later 
13. `> JSON.stringify(myTokenABI);` you will need the contract ABI if you have changed the contract 

# Running instructions
1. Run `npm install`
2. Run `testrpc`
3. Replace the contract address from line `12.` in `app.js` file
4. If you have changed the `MyToken.sol` contract, replace the contract ABI from line `13.` in `MyToken.json` file 
5. Run `npm start`
6. Open `index.html` and start playing
