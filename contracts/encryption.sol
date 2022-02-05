// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;
import "elliptic-curve-solidity/contracts/EllipticCurve.sol";


library encryption {

    uint256 public constant KEY_LENGTH = 32;

    /*

Usually constant e_start can =3 for simplicity. However, 0x10001 is more common, at any rate, a prime number is best (for key-generation performance reasons and probably other reasons).

p and q are the randomly generated positive prime numbers, that require up to l bits for storage. (To keep these positive, the first bit will always be 0)
n = p*q This is used for both the encryption and decryption.
e starts off as e_start. This will eventually be the part of the encryption key.
m = (p-1)*(q-1) is used to convert e to d, which will be used for decryption.
while(gcd(e,m)>1){e+=2} This is necessary for the next step to work.
d=modInverse(e,m) This performs a standard arithmatic operation. Probably not worth examining much, especially if your programming language has this built in


    */


    uint256 public constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 public constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 public constant AA = 0;
    uint256 public constant BB = 7;
    uint256 public constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;


    prepareMove(move){
        const {
            privateKey, publicKey, encryptedValue
        } = encryptValue(move, Math.random(), Math.random())

        contract.setMove(encryptedValue, publicKey) = (encryptedValue, publicKey)=>{
            player[msg.address] = { encryptedValue, publicKey}
        }
    }

    revealMove(){
        contract.revealMove(privateKey) = (privateKey)=>{
            const { encryptedValue, publicKey } = player[msg.address];
            const derivedPublicKey = generatePublicKey(privateKey);
            require(publicKey == derivedPublicKey); // If not bad private key
            const nakedValue = decryptValue(encryptedValue, privateKey);
            require(
                nakedValue == Moves.Rock
                ||
                nakedValue == Moves.Scissor
                ||
                nakedValue == Moves.Paper
            );
            moves[msg.address] = nakedValue
        }
    }

    function encryptValue(bytes32 value, uint256 randomNumberA, uint256 randomNumberB){
        bytes256 privateKey = generatePrivateKey(randomNumberA, randomNumberB);
        bytes256 publicKey = generatePublicKey(privateKey);
        bytes256 encryptedValue = encryptValue(value, privateKey);
        return {
            privateKey: privateKey,
            publicKey: publicKey,
            encryptedValue: encryptedValue
        }
    }

    function generatePrivateKey(uint256 randomNumberA, uint256 randomNumberB) pure returns(bytes256) {

    }

    function generatePublicKey(bytes256 privateKey) pure returns(bytes256) {

    }

    function encryptValue(bytes32 nakedValue, bytes256 privateKey) pure returns(bytes256) {

    }

    function derivePubKey(uint256 privKey) public pure returns(uint256 qx, uint256 qy) {
        (qx, qy) = EllipticCurve.ecMul(
            privKey,GX,GY,AA,PP
        );
    }
}