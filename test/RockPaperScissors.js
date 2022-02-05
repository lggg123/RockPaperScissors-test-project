const { expect } = require("chai");
const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const hre = require("hardhat");
console.log(hre)

describe("RockPaperScissors", async function () {
    let rpsContract;
    let addr1;
    let addr2;
    let addr3;
    let hardhatToken;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        const SampleFactory = await ethers.getContractFactory("RockPaperScissors");
        [addr1, addr2, addr3] = await ethers.getSigners();
        console.log(addr1, addr2, addr3);    
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens once its transaction has been
        // mined.
        rpsContract = await SampleFactory.deploy(1);
      });

    it("Contract Exists", async function() {
        expect(await rpsContract.initialBet()).to.equal(1);
        expect(await rpsContract.Bob()).to.equal(await rpsContract.EMPTY_ADDRESS());
        expect(await rpsContract.Alice()).to.equal(await rpsContract.EMPTY_ADDRESS());
    })

    it("win conditions", async function() {
        expect()
    })
});