const { expect } = require("chai");
const { ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const { BigNumber } = ethers;

describe("RockPaperScissors", async function () {
    const API_KEY = "CWASSQJ54U1FG9ZTJCFGQGBR1TQM2S7XJU"
    const provider = ethers.getDefaultProvider();
    let rpsContract;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let hardhatToken;
    const BET_AMOUNT = 1;

    const defaultOptions = {
        gasPrice: "0x0"
    }

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        const SampleFactory = await ethers.getContractFactory("RockPaperScissors");
        [owner] = await ethers.getSigners();
        const addresses = [];
        console.log("about to setup addresses")
        for(var i = 0; i < 3; i++){
            let privateKey = Date.now().toString(16) + i + Math.random().toString(16).substring(2);
            if(privateKey.length%2 === 1) privateKey = privateKey + "0";
            const addr = new ethers.Wallet("0x" + privateKey, provider);
            await owner.sendTransaction({
                to: getAddress(addr),
                value: BigNumber.from("100"), // Sends exactly 1.0 ether
            });
            addresses.push(addr);
        }

        [addr1, addr2, addr3] = addresses;
        console.log("setup addresses")
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens once its transaction has been
        // mined.
        rpsContract = await SampleFactory.deploy(BET_AMOUNT);
    });

    it("Contract Exists", async function() {
        expect(await rpsContract.initialBet()).to.equal(1);
        expect(await rpsContract.Bob()).to.equal(await rpsContract.EMPTY_ADDRESS());
        expect(await rpsContract.Alice()).to.equal(await rpsContract.EMPTY_ADDRESS());
    })

    it("win conditions", async function() {
        /*

        const sum = [1,2,3,4,5,6].reduce((previousValue, currentValue)=>{
            return previousValue + currentValue;
        }, 0);
        const resolvedSum = await [1,2,3,4,5,6].reduce(async (previousPromise, currentValue)=>{
            const previousValue = await previousPromise
            return previousValue + currentValue;
        }, Promise.resolve(0));
        P.then(()=>{
            return P2
        }).then(()=>{
            return P3
        })
        */

        const moves = await rpsContract.getMoveKeys();
        return moves.reduce(async (previousPromise, losingMove, index)=>{
            await previousPromise;
            console.log("lose win start")
            const winningMove = moves[(index + 1)%moves.length];

            await runAsUser(rpsContract, addr1).reserveSpot(defaultOptions)
            await runAsUser(rpsContract, addr2).reserveSpot(defaultOptions)

            const initialLosingValue = await getValueOfAddress(addr1);
            const initialWinningValue = await getValueOfAddress(addr2);
            const initialContractValue = await getValueOfAddress(rpsContract.address);
            console.log("got initial values")

            await runAsUser(rpsContract, addr1).deposit({
                ...defaultOptions,
                value: BigNumber.from(1)
            })
            await runAsUser(rpsContract, addr2).deposit({
                ...defaultOptions,
                value: BigNumber.from(1),
            })
            console.log("deposited")

            const depositLosingValue = await getValueOfAddress(addr1);
            const depositWinningValue = await getValueOfAddress(addr2);
            const depositContractValue = await getValueOfAddress(rpsContract.address);
            console.log("got deposit values")

            expect(
                BigNumber.from(initialLosingValue).sub(BET_AMOUNT).toString()
            ).to.equal(
                BigNumber.from(depositLosingValue).toString()
            )
            expect(
                BigNumber.from(initialWinningValue).sub(BET_AMOUNT).toString()
            ).to.equal(
                BigNumber.from(depositWinningValue).toString()
            )
            expect(initialContractValue).to.equal(0);
            expect(
                BigNumber.from(initialContractValue).add(BET_AMOUNT * 2).toString()
            ).to.equal(
                BigNumber.from(depositContractValue).toString()
            )


            const encryptedLosingMove = await rpsContract.encryptMove(losingMove, 1);
            await rpsContract.play(encryptedLosingMove, {
                ...defaultOptions,
                from: getAddress(addr1)
            });
            const encryptedWinningMove = await rpsContract.encryptMove(winningMove, 1);
            await rpsContract.play(encryptedWiningMove, {
                ...defaultOption,
                from: getAddress(addr2)
            });

            console.log("played encrypted moves")

            const derivedLosingMove = await runAsUser(rpsContract, addr1).reveal()
            expect(derivedLosingMove).to.equal(await rpsContract.getMoveValueByKey(losingMove));
            const derivedWinningMove = await runAsUser(rpsContract, addr2).reveal(winningMove)
            expect(derivedWinningMove).to.equal(await rpsContract.getMoveValueByKey(winnningMove));
            console.log("revealed the move")

            const outcome = await rpsContract.getOutcome(defaultOptions);
            console.log("got outcome")


            const outcomeLosingValue = await getValueOfAddress(addr1);
            const outcomeWinningValue = await getValueOfAddress(addr2);
            const outcomeContractValue = await getValueOfAddress(rpsContract.address);

            expect(
                BigNumber.from(depositLosingValue).toString()
            ).to.equal(
                BigNumber.from(outcomeLosingValue).toString()
            )
            expect(
                BigNumber.from(depositWinningValue).add(BET_AMOUNT * 2).toString()
            ).to.equal(
                BigNumber.from(outcomeWinningValue).toString()
            )
            expect(
                BigNumber.from(initialContractValue).toString()
            ).to.equal(
                BigNumber.from(outcomeContractValue).toString()
            )

            expect(await rpsContract.Bob()).to.equal(await rpsContract.EMPTY_ADDRESS());
            expect(await rpsContract.Alice()).to.equal(await rpsContract.EMPTY_ADDRESS());
            console.log("finished");

        }, Promise.resolve());
    })

    it("tie conditions", async function() {
        /*

        const sum = [1,2,3,4,5,6].reduce((previousValue, currentValue)=>{
            return previousValue + currentValue;
        }, 0);
        const resolvedSum = await [1,2,3,4,5,6].reduce(async (previousPromise, currentValue)=>{
            const previousValue = await previousPromise
            return previousValue + currentValue;
        }, Promise.resolve(0));
        P.then(()=>{
            return P2
        }).then(()=>{
            return P3
        })
        */

        const moves = await rpsContract.getMoveKeys();
        return moves.reduce(async (previousPromise, move, index)=>{
            await previousPromise;

            await rpsContract.reserveSpot({
                from: getAddress(addr1)
            })
            await rpsContract.reserveSpot({
                from: getAddress(addr2)
            })

            const initialAValue = await getValueOfAddress(addr1);
            const initialBValue = await getValueOfAddress(addr2);
            const initialContractValue = await getValueOfAddress(rpsContract.address);

            await rpsContract.deposit({
                from: getAddress(addr1),
                value: BET_AMOUNT
            })
            await rpsContract.deposit({
                from: getAddress(addr2),
                value: BET_AMOUNT
            })

            const depositAValue = await getValueOfAddress(addr1);
            const depositBValue = await getValueOfAddress(addr2);
            const depositContractValue = await getValueOfAddress(rpsContract.address);

            expect(
                BigNumber(initialAValue).minus(BET_AMOUNT).toString()
            ).to.equal(
                BigNumber(depositAValue).toString()
            )
            expect(
                BigNumber(initialBValue).minus(BET_AMOUNT).toString()
            ).to.equal(
                BigNumber(depositBValue).toString()
            )
            expect(initialContractValue).to.equal(0);
            expect(
                BigNumber(initialContractValue).plus(BET_AMOUNT * 2).toString()
            ).to.equal(
                BigNumber(depositContractValue).toString()
            )


            const encryptedAMove = await rpsContract.encryptMove(move, 1);
            await rpsContract.play(encryptedAMove, {
                from: getAddress(addr1)
            });
            const encryptedBMove = await rpsContract.encryptMove(move, 1);
            await rpsContract.play(encryptedWiningMove, {
                from: getAddress(addr2)
            });

            const derivedAMove = await rpsContract.reveal(move, {
                from: getAddress(addr1)
            })
            expect(derivedAMove).to.equal(await rpsContract.getMoveValueByKey(move));
            const derivedBMove = await rpsContract.reveal(move, {
                from: getAddress(addr2)
            })
            expect(derivedBMove).to.equal(await rpsContract.getMoveValueByKey(move));

            const outcome = await rpsContract.getOutcome();


            const outcomeAValue = await getValueOfAddress(addr1);
            const outcomeBValue = await getValueOfAddress(addr2);
            const outcomeContractValue = await getValueOfAddress(rpsContract.address);

            expect(
                BigNumber(initialAValue).toString()
            ).to.equal(
                BigNumber(outcomeAValue).toString()
            )
            expect(
                BigNumber(initialBValue).toString()
            ).to.equal(
                BigNumber(outcomeBValue).toString()
            )
            expect(
                BigNumber(initialContractValue).toString()
            ).to.equal(
                BigNumber(outcomeContractValue).toString()
            )

            expect(await rpsContract.Bob()).to.equal(await rpsContract.EMPTY_ADDRESS());
            expect(await rpsContract.Alice()).to.equal(await rpsContract.EMPTY_ADDRESS());

        }, Promise.resolve());
    })

    function runAsUser(contract, maybeAddress){
        return contract.connect(maybeAddress)
    }

    function getAddress(address){
        if(typeof address === "string"){
            return address;
        }
        if(typeof address === "object" && "isSigner" in address && address.isSigner()){
            return address.address;
        }
        if(typeof address === "object" && typeof address.address === "string"){
            return address.address;
        }
        console.log("bad address");
        throw address;

    }

    function getValueOfAddress(address){
        return provider.getBalance(getAddress(address));
    }
});


