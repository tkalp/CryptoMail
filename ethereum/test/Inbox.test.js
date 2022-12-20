const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const compiledInbox = require("../build/Inbox.json");
const compiledInboxFactory = require("../build/InboxFactory.json");
let accounts;
let factory;
let inbox1;
let inbox2;
let subject;
let body;

beforeEach(async () => {
  try {
    accounts = await web3.eth.getAccounts();
    // deploy the factory, that's it
    factory = await new web3.eth.Contract(compiledInboxFactory.abi)
      .deploy({
        data: compiledInboxFactory.evm.bytecode.object,
      })
      .send({
        from: accounts[0],
        gas: "3000000",
      });

    // I want to create an inbox for two accounts as well
    await factory.methods.createInbox().send({
      from: accounts[1],
      gasLimit: "3000000",
    });

    await factory.methods.createInbox().send({
      from: accounts[2],
      gasLimit: "3000000",
    });

    const inbox1Address = await factory.methods.inboxes(0).call();
    const inbox2Address = await factory.methods.inboxes(1).call();

    inbox1 = await new web3.eth.Contract(compiledInbox.abi, inbox1Address);
    inbox2 = await new web3.eth.Contract(compiledInbox.abi, inbox2Address);

    // add address 1 as a contact to address 2's inbox
    await inbox2.methods.addContact(accounts[1]).send({
      from: accounts[2],
      gasLimit: "3000000",
    });

    // let's send a message as well
    subject = "First Ever Message";
    body = "Here is a message to send you";

    await inbox1.methods.sendMessage(accounts[2], subject, body).send({
      from: accounts[1],
      gasLimit: "3000000",
    });
  } catch (err) {
    console.log(err);
  }
});

describe("tests for inbox", () => {
  xit("deployed a factory and inboxes are okay", async () => {
    assert.ok(factory.options.address);
    assert.ok(inbox1.options.address);
    assert.ok(inbox2.options.address);
  });

  xit("both inboxes contain the same factory address", async () => {
    let factoryAddress = await inbox1.methods.factory().call();
    assert.equal(factoryAddress, factory.options.address);
    factoryAddress = await inbox2.methods.factory().call();
    assert.equal(factoryAddress, factory.options.address);
  });

  xit("inbox contains correct owners", async () => {
    let owner = await inbox1.methods.owner().call();
    assert.equal(owner, accounts[1]);
    owner = await inbox2.methods.owner().call();
    assert.equal(owner, accounts[2]);
  });

  xit("should not allow an inbox owner to create another inbox", async () => {
    try {
      await factory.methods.createInbox().send({
        from: accounts[2],
        gasLimit: "3000000",
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  xit("can retrieve contacts from inbox", async () => {
    const events = await inbox2.getPastEvents("AddedContact", {
      fromBlock: 0,
      toBlock: "latest",
    });

    assert.equal(events[0].returnValues[0], accounts[1]);
  });

  xit("address 1 sent message to address 2", async () => {
    const messages = await inbox2.methods.getMessages().call({
      from: accounts[2],
    });

    // there should only ever be one message
    const message = messages[0];

    assert.equal(message.sender, accounts[1]);
    assert.equal(message.subject, subject);
    assert.equal(message.body, body);
  });
  xit("owner can send an opened flag to the chain", async () => {
    const messages = await inbox2.methods.getMessages().call({
      from: accounts[2],
    });

    // there should only ever be one message
    const message = messages[0];
    // this message has been checked so we have to send the transaction
    await inbox2.methods.openMessage(message.id).send({
      from: accounts[2],
    });
    // now we have to check if it was opened
    const opened = await inbox2.methods.messagesOpened(message.id).call({
      from: accounts[2],
    });

    assert.ok(opened);
  });
  xit("create a new inbox for address 3 and try to send to address 1 or 2", async () => {
    const account = accounts[3];
    await factory.methods.createInbox().send({
      from: account,
      gasLimit: "3000000",
    });

    const inboxAddress = await factory.methods.ownerToInbox(account).call();
    const inbox = await new web3.eth.Contract(compiledInbox.abi, inboxAddress);

    try {
      await inbox.methods.sendMessage(accounts[2], "test", "test").send({
        from: account,
        gasLimit: "3000000",
      });
      assert(false);
    } catch (err) {
      console.log(err.results.reason);
      assert(true);
    }
  });
  xit("address not in contacts, should not be able to send", async () => {});
  it("can retrieve historical contacts from an inbox", async () => {
    const history = await inbox2.getPastEvents("AddedContact", {
      fromBlock: 0,
      toBlock: "latest",
    });
    let contacts = [];
    for (const event of history) {
      const returnValue = event.returnValues;
      contacts.push(returnValue[0]);
    }

    assert.equal(contacts[0], accounts[1]);
  });
});
