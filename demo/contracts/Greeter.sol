//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.18;

contract Greeter {
    string private greeting;
    address private owner;

    constructor(string memory _greeting) {
        owner = msg.sender;
        greeting = _greeting;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    } 

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public onlyOwner {
        greeting = _greeting;
    }
}
