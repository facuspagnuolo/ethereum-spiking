# Deploying instructions
1. Install JS solidity compiler `npm install solc -g`
2. Run `testrpc`
3. Open node console
4. `> Web3 = require('web3');`
5. `> const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));`
6. `> const solidityCompiler = require('solc');`
7. `> myTokenCode = fs.readFileSync('MyToken.sol').toString();`
8. `> compiledCode = solidityCompiler.compile(myTokenCode);`
9. `> myTokenABI = JSON.parse(compiledCode.contracts[':MyToken'].interface);`
10. `> MyTokenContract = web3.eth.contract(myTokenABI);`
11. `> myTokenByteCode = compiledCode.contracts[':MyToken'].bytecode;`
12. `> deployedContract = MyTokenContract.new(1000, {data: myTokenByteCode, from: web3.eth.accounts[0], gas: 999999});` feel free to use any account
13. `> deployedContract.address;` you will need this address later 
14. `> JSON.stringify(myTokenABI);` you will need the contract ABI if you have changed the contract 

# Running instructions
1. Run `npm install`
2. Run `testrpc`
3. Replace the contract address from line `13.` in `app.js` file
4. If you have changed the `MyToken.sol` contract, replace the contract ABI from line `14.` in `MyToken.json` file 
5. Run `npm start`
6. Open `index.html` and start playing
