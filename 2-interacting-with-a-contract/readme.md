# Deploying instructions
1. Run `npm install`
2. Run `npx testrpc`
3. Open node console and run:
```js
Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const solidityCompiler = require('solc')
myTokenCode = fs.readFileSync('MyToken.sol').toString()
compiledCode = solidityCompiler.compile(myTokenCode)
myTokenABI = JSON.parse(compiledCode.contracts[':MyToken'].interface)
MyTokenContract = web3.eth.contract(myTokenABI)
myTokenByteCode = compiledCode.contracts[':MyToken'].bytecode
deployedContract = MyTokenContract.new({data: myTokenByteCode, from: web3.eth.accounts[0], gas: 999999})
deployedContract.address //you will need this address later  
```

# Running instructions
1. Run `npm install` 
2. Run `npx testrpc` 
3. Open `index.html` and start playing 
4. Run `npm start` if are editing any JS file
