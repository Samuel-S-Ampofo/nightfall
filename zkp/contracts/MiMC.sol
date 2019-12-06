// Copyright (c) 2018 HarryR
// License: LGPL-3.0+

pragma solidity ^0.5.0;

/**
* Implements MiMC-p/p over the altBN scalar field used by zkSNARKs
*
* See: https://eprint.iacr.org/2016/492.pdf
*
* Round constants are generated in sequence from a seed
*/
<<<<<<< HEAD
contract MiMC
=======
library MiMC
>>>>>>> feat(zkp): debugging mimc hash
{
    function GetScalarField ()
        internal pure returns (uint256)
    {
<<<<<<< HEAD
        return 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001; //base of field used
=======
        return 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
>>>>>>> feat(zkp): debugging mimc hash
    }

    function Encipher( uint256 in_x, uint256 in_k )
        public pure returns(uint256 out_x)
    {
        bytes4 seed = 0x6d696d63; //this is 'mimc' in hex
        return MiMCpe7( in_x, in_k, uint256(keccak256(abi.encodePacked(seed))), 91 );
    }

    /**
    * MiMC-p/p with exponent of 7
    *
    * Recommended at least 46 rounds, for a polynomial degree of 2^126
    */
    function MiMCpe7( uint256 in_x, uint256 in_k, uint256 in_seed, uint256 round_count )
        internal pure returns(uint256 out_x)
    {
        assembly {
            if lt(round_count, 1) { revert(0, 0) }

            // Initialise round constants, k will be hashed
            let c := mload(0x40)
            mstore(0x40, add(c, 32))
            mstore(c, in_seed)

            let localQ := 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
            let t
            let a

            // Further n-2 subsequent rounds include a round constant
            for { let i := round_count } gt(i, 0) { i := sub(i, 1) } {
                // c = H(c)
                mstore(c, keccak256(c, 32))

                // x = pow(x + c_i, 7, p) + k
                t := addmod(addmod(in_x, mload(c), localQ), in_k, localQ)              // t = x + c_i + k
                a := mulmod(t, t, localQ)                                              // t^2
                in_x := mulmod(mulmod(a, mulmod(a, a, localQ), localQ), t, localQ)     // t^7
            }

            // Result adds key again as blinding factor
<<<<<<< HEAD
            out_x := addmod(in_x, in_k, localQ)
=======
            // out_x := addmod(in_x, in_k, localQ)
            out_x := a
            // out_x := mload(c)
>>>>>>> feat(zkp): debugging mimc hash
        }
    }

    function MiMCpe7_mp( uint256[] memory in_x, uint256 in_k, uint256 in_seed, uint256 round_count )
        internal pure returns (uint256)
    {
        uint256 r = in_k;
        uint256 localQ = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
<<<<<<< HEAD
        uint256 i;
        for( i = 0; i < in_x.length; i++ )
        {
            r = (r + (in_x[i] % localQ) + MiMCpe7(in_x[i], r, in_seed, round_count)) % localQ;
        }
        return r;
=======

        for( uint256 i = 0; i < in_x.length; i++ )
        {
            r = (r + in_x[i] + MiMCpe7(in_x[i], r, in_seed, round_count)) % localQ;
        }
        // return r;
        return MiMCpe7(in_x[0], r, in_seed, round_count);
>>>>>>> feat(zkp): debugging mimc hash
    }

    function Hash( uint256[] memory in_msgs, uint256 in_key )
        public pure returns (uint256)
    {
        bytes4 seed = 0x6d696d63; //this is 'mimc' in hex
<<<<<<< HEAD
        return MiMCpe7_mp( in_msgs, in_key, uint256(keccak256(abi.encodePacked(seed))), 91 );
    }

    function mimcHash( bytes32[] memory in_msgs )
        public pure returns (bytes32)
    {
        uint256[] memory msgs = new uint256[](in_msgs.length);
        for ( uint256 i=0; i < in_msgs.length; i++) {
          msgs[i] = uint256(in_msgs[i]); //convert to uints so we can do arithmetic
        }
        return bytes32(Hash( msgs, 0 ));
    }
  }
=======
        return MiMCpe7_mp( in_msgs, in_key, uint256(keccak256(abi.encodePacked(seed))), 12 );
    }

    function Hash( uint256[] memory in_msgs )
        public pure returns (uint256)
    {
        return Hash( in_msgs, 0 );
    }

    function testModMul() public pure returns(uint256 a) {
      assembly{
        let t := 14686898617697374517354030448549207100630038260701390942534165322324606310525
        let localQ := 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
        a := mulmod(t, t, localQ)                                              // t^2
      }
    }
}
>>>>>>> feat(zkp): debugging mimc hash
