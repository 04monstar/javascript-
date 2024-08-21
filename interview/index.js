const crypto = require('crypto');
const readline = require('readline');

// Setup readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;  
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash('sha256')
                 .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash)
                 .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, '01/01/2024', { email: '', password: '' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

class SecureBlockchain extends Blockchain {
  constructor() {
    super();
    this.secretKey = crypto.createHash('sha256').update('my_super_secret_key').digest('base64').substr(0, 32);
  }

  addSecureBlock(email, password) {
    const encryptedEmail = this.encrypt(email);
    const encryptedPassword = this.encrypt(password);
    
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      { email: encryptedEmail, password: encryptedPassword }
    );

    this.addBlock(newBlock);
  }

  encrypt(text) {
    const algorithm = 'aes-256-ctr';
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, this.secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
    };
  }

  decrypt(hash) {
    const algorithm = 'aes-256-ctr';
    const iv = Buffer.from(hash.iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, this.secretKey, iv);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final()
    ]);

    return decrypted.toString();
  }

  decodeBlockData(blockIndex) {
    const block = this.chain[blockIndex];
    if (block) {
      const email = this.decrypt(block.data.email);
      const password = this.decrypt(block.data.password);
      return { email, password };
    } else {
      throw new Error('Block not found!');
    }
  }

  printBlockchain() {
    console.log(JSON.stringify(this.chain, null, 4));
  }
}

// Create a new instance of SecureBlockchain
const myBlockchain = new SecureBlockchain();

// Function to get user input and add blocks
function getUserInput() {
  rl.question('Enter email: ', (email) => {
    rl.question('Enter password: ', (password) => {
      myBlockchain.addSecureBlock(email, password);
      console.log('Block added to the blockchain.');
      
      // Display the full blockchain after adding the block
      console.log('\nCurrent Blockchain:');
      myBlockchain.printBlockchain();

      rl.question('Would you like to add another block? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
          getUserInput();
        } else {
          rl.question('Would you like to decode any block? (yes/no): ', (decodeAnswer) => {
            if (decodeAnswer.toLowerCase() === 'yes') {
              rl.question('Enter the block index to decode: ', (index) => {
                try {
                  const decodedData = myBlockchain.decodeBlockData(parseInt(index));
                  console.log('Decoded Email:', decodedData.email);
                  console.log('Decoded Password:', decodedData.password);
                } catch (error) {
                  console.log(error.message);
                }
                rl.close();
              });
            } else {
              console.log('Blockchain valid:', myBlockchain.isChainValid());
              rl.close();
            }
          });
        }
      });
    });
  });
}

// Start getting user input
getUserInput();
