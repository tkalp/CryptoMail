// SPDX-License-Identifier: UCBS

pragma solidity ^0.8.17;

/// @author Teddy Kalp
/// @title  An inbox contracts that holds messages for owners
/// @dev    Perhaps we add a contacts mapping so that owners don't recieve spam or malicious
///         emails

contract Inbox {
    // owner of the inbox
    address public owner;
    // factory, this is saved across all inboxes
    address public factory;
    // current id of messages
    uint256 private _currentId = 0;
    // contacts to be saved -> could we turn this into a merkle root?
    mapping(address => bool) private contacts;
    // mapping that tracks messages that have been opened
    mapping(uint256 => bool) public messagesOpened;
    // event that tracks added contacts, this can help us display the contacts to user via UI
    // Do this via API calls
    event AddedContact(address);

    struct Message {
        uint256 id;
        address sender;
        string subject;
        string body;
        uint256 timestamp;
    }

    // Only allow access to the owner of the contract
    Message[] private messages;

    constructor(address _owner, address _factory) {
        owner = _owner;
        factory = _factory;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not the owner of the inbox!");
        _;
    }

    modifier onlyContact(address sender) {
        require(
            contacts[sender] || (msg.sender == owner),
            "not a whitelist of this address"
        );
        _;
    }

    function receiveMessage(
        address _sender,
        string memory _subject,
        string memory _body,
        uint256 _timestamp
    ) external onlyContact(_sender) {
        Message memory message = Message({
            id: _currentId,
            sender: _sender,
            subject: _subject,
            body: _body,
            timestamp: _timestamp
        });

        messages.push(message);
        _currentId = _currentId + 1;
    }

    function sendMessage(
        address _receipient,
        string memory _subject,
        string memory _body
    ) public onlyOwner {
        InboxFactory inboxFactory = InboxFactory(factory);
        inboxFactory.routeMessage(owner, _receipient, _subject, _body);
    }

    function openMessage(uint256 messageId) public onlyOwner {
        messagesOpened[messageId] = true;
    }

    function getMessages() public view onlyOwner returns (Message[] memory) {
        return messages;
    }

    function addContact(address _newContact) public onlyOwner {
        contacts[_newContact] = true;
        emit AddedContact(_newContact);
    }
}

/// @author Teddy Kalp
/// @title An inbox factory that keeps track of all inboxes,
/// as well as main method of send messages to inboxes

contract InboxFactory {
    address[] public inboxes;
    mapping(address => bool) public addressHasInbox;
    mapping(address => address) public ownerToInbox;

    modifier hasInbox(address client) {
        require(addressHasInbox[client], "address does not have inbox");
        _;
    }

    modifier noInbox(address client) {
        require(!addressHasInbox[client], "address already has inbox!");
        _;
    }

    // need to check if sender already has inbox
    function createInbox() public noInbox(msg.sender) {
        address inbox = address(new Inbox(msg.sender, address(this)));
        inboxes.push(inbox);
        ownerToInbox[msg.sender] = inbox;
        addressHasInbox[msg.sender] = true;
    }

    function routeMessage(
        address _sender,
        address _receipient,
        string memory _subject,
        string memory _body
    ) external hasInbox(_receipient) {
        Inbox inbox = Inbox(ownerToInbox[_receipient]);
        inbox.receiveMessage(_sender, _subject, _body, block.timestamp);
    }
}

//0x5B38Da6a701c568545dCfcB03FcB875f56beddC4 -> 0xa98ec8757C9D9d56427158f7E6F6F34decE87958

//0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 -> 0x96BC22467f8D2D5e9B8Bb54c35461f25Db077cb7
