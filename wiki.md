# Simple Definitions
## Context
### Blockchain
A blockchain is a globally shared, transactional database. Everyone can read entries in the database just by participating in the network.
If you want to change something in the database, you have to create a `transaction` which has to be accepted by all others.

### Transactions
It implies that the change you want to make is either not done at all or completely applied.
While your transaction is applied to the database, no other transaction can alter it.
A transaction is always cryptographically signed by the sender (creator).

### Double-spend Attack
What happens if two transactions exist in the network that both want to empty an account?
An order of the transactions will be selected for you, the transactions will be bundled into what is called a `block` and then they will be executed and distributed among all participating nodes.
If two transactions contradict each other, the one that ends up being second will be rejected and not become part of the block.
These blocks form a linear sequence in time and that is where the word “blockchain” derives from.

### Smart Contract
Computer programs used to secure, execute and enforce interactions between parties, proposed by Nick Szabo in 1996.

### ICO

### Crowdsale

### DAO
A decentralized autonomous organization (DAO), sometimes labeled a decentralized autonomous corporation (DAC), is an organization that is run through rules encoded as computer programs called smart contracts.[1]:229 A DAO's financial transaction record and program rules are maintained on a blockchain.[1]:229[2][3] There are several examples of this business model. The precise legal status of this type of business organization is unclear.[4]

## Ethereum
### Ethereum
Ethereum is an open-source, public, blockchain-based distributed computing platform for smart contracts scripting, which facilitates online contractual agreements.
It provides a decentralized Turing-complete virtual machine, the Ethereum Virtual Machine.

### Ethereum Virtual Machine (EVM)
EVM is the runtime environment for smart contracts in Ethereum.
It is not only sandboxed but actually completely isolated, which means that code running inside the EVM has no access to network, filesystem or other processes.
Smart contracts even have limited access to other smart contracts.

### Ether
It is the value token of Ethereum. It is listed under the code ETH and traded on cryptocurrency exchanges.

### Gas
Every single operation that is executed inside the EVM is actually simultaneously executed by every node in the network.
Each of these operations have a cost measured in gas, and each gas unit consumed by a transaction must be paid for in Ether.
Gas/Ether price which changes dynamically, and it's deducted from the Ethereum account sending the transaction.
Transactions also have a gas limit parameter that is an upper bound on how much gas the transaction can consume.

### Solidity
Solidity is a contract-oriented high-level language, with similar syntax to JavaScript.
It is statically typed, supports inheritance, libraries and complex user-defined types.

### Accounts
There are two kinds of accounts which share the same address space.
External accounts that are controlled by public-private key pairs and contract accounts which are controlled by the code stored together with the account.

### Transactions
A transaction is a message that is sent from one account to another account, which can be the same or the special zero-account.
If the target account contains code, that code is executed and the payload is provided as input data.
But, if the target account is the same or zero-account, the transaction creates a new contract. The payload must be EVM bytecode, which will be executed and it's output will be permanently stored as the code of the contract.
This means that in order to create a contract, you do not send the actual code of the contract, but in fact code that returns that code.

### Storage
Each account has a persistent memory area which is called storage, a key-value store that maps 256-bit words to 256-bit words.
A contract can neither read nor write to any storage apart from its own.

### Memory
The second memory area is called memory, of which a contract obtains a freshly cleared instance for each message call.
Memory is linear and can be addressed at byte level, but reads are limited to a width of 256 bits, while writes can be either 8 bits or 256 bits wide.

### Stack
The EVM is not a register machine but a stack machine, so all computations are performed on an area called the stack.
It has a maximum size of 1024 elements and contains words of 256 bits.

### Instruction Set
The instruction set of the EVM is kept minimal in order to avoid incorrect implementations which could cause consensus problems.
All instructions operate on the basic data type, 256-bit words.

## Complementary
### The DAO
The DAO was a digital DAO, meant to operate like a venture capital fund providing a new descentralized business model for organizing commercial and non-profit enterprises.
The DAO was stateless, and not tied to any particular nation state. It was crowdfunded via a token sale in May 2016. It set the record for the largest crowdfunding campaign in history.
In June 2016, users exploited a vulnerability in the DAO code to enable them to siphon off one third of The DAO's funds to a subsidiary account.
