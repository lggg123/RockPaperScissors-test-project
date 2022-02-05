// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract RockPaperScissors {
     // the minimum needed to enroll
    uint public BET_MIN = 1;
    uint public initialBet;
    uint public balanceReceived;
    uint private firstReveal;
    uint private REVEAL_TIMEOUT = 60 * 60 * 1000;

    enum Moves {None, Rock, Paper, Scissors}
    enum Outcomes {None, Bob, Alice, Draw}

    // Players Bob and Alice
    address payable public Bob;
    address payable public Alice;
    address payable public EMPTY_ADDRESS;

    // DAI token
    IERC20 public daiToken; // DAI state variable

    // moves
    bytes32 private encryptmoveBob;
    bytes32 private encryptmoveAlice;

    // Clear moves set only after both players have committed their encrypted moves
    Moves private moveBob;
    Moves private moveAlice;

    constructor(uint _initialBet) {
        require(_initialBet >= BET_MIN);
        initialBet = _initialBet;
    }

    modifier enroll() {
        require(msg.value >= BET_MIN);
        require(balanceReceived == 0 || msg.value >= balanceReceived);
        _;
    }

    // function deposit() external payable{
    //     playerBalances[msg.sender] += msg.value;
    // }

    // function withdraw() external payable {
    //     uint playerBalance = playerBalanaces[msg.sender];
    //     require(playerBalance > 0);
        
    //     playerBalances[msg.sender] = 0;
    //     (bool success, ) = address(msg.sender).call{ value: playerBalance }("");
    //     require(success, "withdraw failed to send");
    // }

    // Save players move and return 'true' if move is 
    // valid, 'false' otherwise.

    function encrypt() public {

    }
    function play(bytes32 Move) public returns (bool) {
        if (msg.sender == Bob && encryptmoveBob == 0x0) {
            encryptmoveBob = Move;
        } else if (msg.sender == Alice && encryptmoveAlice == 0x0) {
            encryptmoveAlice = Move;
        } else {
            return false;
        }
        return true;
    }

    modifier commitPhaseEnded() {
        require(encryptmoveBob != 0x0 && encryptmoveAlice != 0x0);
        _;
    }

    // Compare move with the saved move
    // Return clear with success, 'Moves.None' otherwise.
    function reveal(string memory clearMove) public commitPhaseEnded returns (Moves) {
        bytes32 Move = sha256(abi.encodePacked(clearMove));
        Moves move = Moves(getFirstChar(clearMove)); // Actual move (Rock/Paper/Scissors)

        // If move invalid, exit 
        if (move == Moves.None) {
            return Moves.None;
        }

        // If match, clear move is saved
        if (msg.sender == Bob && Move == encryptmoveBob) {
            moveBob = move;
        } else if (msg.sender == Alice && Move == encryptmoveAlice) {
            moveAlice = move;
        } else {
            return Moves.None;
        }

        // Timer starts after first revelation from one of the player
        if (firstReveal == 0) {
            firstReveal = block.timestamp;
        }
        
        return move;
    }

    // Return the first character of a given string.
    function getFirstChar(string memory str) private pure returns (uint) {
        bytes1 firstByte = bytes(str)[0];
        if (firstByte == 0x31) {
            return 1;
        } else if (firstByte == 0x32) {
            return 2;
        } else if (firstByte == 0x33) {
            return 3;
        } else {
            return 0;
        }
    }

    modifier revealPhaseEnded() {
        require(
            (moveBob != Moves.None && moveAlice != Moves.None)
            ||
            (firstReveal != 0 && block.timestamp > firstReveal + REVEAL_TIMEOUT)
        );
        _;
    }

    // Compute the outcome and pay the winner(s).
    // Return the outcome.
    function getOutcome() public revealPhaseEnded returns (Outcomes) {
        Outcomes outcome;

        if (moveBob == moveAlice) {
            outcome = Outcomes.Draw;
        } else if ((moveBob == Moves.Rock && moveAlice == Moves.Scissors) || (moveBob == Moves.Paper && moveAlice == Moves.Rock) || (moveBob == Moves.Scissors && moveAlice == Moves.Paper) || (moveBob != Moves.None && moveAlice == Moves.None)) {
            outcome = Outcomes.Bob;
        } else {
            outcome = Outcomes.Alice;
        }

        address payable addrA = Bob;
        address payable addrB = Alice;
        uint betBob = initialBet;
        reset(); // Reset game before paying to avoid attacks
        pay(addrA, addrB, betBob, outcome);

        return outcome;
    }

    // Pay the winner 
    function pay(address payable addrA, address payable addrB, uint betBob, Outcomes outcome) private {
        if (outcome == Outcomes.Bob) {
            addrA.transfer(address(this).balance);
        } else if (outcome == Outcomes.Alice) {
            addrB.transfer(address(this).balance);
        } else {
            addrA.transfer(betBob);
            addrB.transfer(address(this).balance);
        }
    }

    // Reset the game 
    function reset() private {
        initialBet = 0;
        firstReveal = 0;
        Bob = EMPTY_ADDRESS;
        Alice = EMPTY_ADDRESS;
        encryptmoveBob = 0x0;
        encryptmoveAlice = 0x0;
        moveBob = Moves.None;
        moveAlice = Moves.None;
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function bothPlayed() public view returns (bool) {
        return (encryptmoveBob != 0x0 && encryptmoveAlice != 0x0);
    }

    // Return 'true' if both players have revealed their move, 'false' otherwise.
    function bothRevealed() public view returns (bool) {
        return (moveBob != Moves.None && moveAlice != Moves.None);
    }
}