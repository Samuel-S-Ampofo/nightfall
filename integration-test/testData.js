import config from 'config';
import utils from '../zkp-utils';

const { rndHex, leftPadHex } = utils;
const LEAF_HASHLENGTH = config.get('LEAF_HASHLENGTH');

const generateTokenID = async () => rndHex(32);

// test data.
export default {
  alice: {
    name: 'alice',
    email: 'alice@ey.com',
    password: 'pass',
    get pk() {
      return this.sk === undefined ? undefined : utils.hash(this.sk); // sk - set at login test suit (step 2)
    },
  },
  bob: {
    name: 'bob',
    email: 'bob@ey.com',
    password: 'pass',
    get pk() {
      return this.sk === undefined ? undefined : utils.hash(this.sk); // sk - set at login test suit (step 2)
    },
  },
  erc721: {
    tokenURI: 'one',
    tokenId: generateTokenID(),
  },
  erc20: {
    mint: 5,
    toBeMintedAsCommitment: [2, 3],
    transfer: 4,
    get change() {
      return this.toBeMintedAsCommitment.reduce((a, b) => a + b, -this.transfer);
    },
  },

  // dependent data
  async erc721Commitment() {
    const { alice, bob, erc721 } = this;

    erc721.tokenId = await erc721.tokenId;

    return {
      uri: erc721.tokenURI,
      tokenId: erc721.tokenId,
      mintCommitmentIndex: '0',
      transferCommitmentIndex: '1',

      // commitment while mint
      get mintCommitment() {
        return utils.concatenateThenHash(
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          alice.pk,
          this.salt, // salt - set at erc-721 commitment mint (step 4)
        );
      },

      // commitment while transfer
      get transferCommitment() {
        return utils.concatenateThenHash(
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          bob.pk,
          this.transferredSalt, // S_B - set at erc-721 commitment transfer to bob (step 5)
        );
      },
    };
  },

  // dependent data
  async erc20Commitments() {
    const { alice, bob, erc20 } = this;

    return {
      mint: [
        {
          amount: leftPadHex(erc20.toBeMintedAsCommitment[0], 32),
          commitmentIndex: 0,
          get commitment() {
            return utils.concatenateThenHash(
              this.amount,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 10)
            );
          },
        },
        {
          amount: leftPadHex(erc20.toBeMintedAsCommitment[1], 32),
          commitmentIndex: 1,
          get commitment() {
            return utils.concatenateThenHash(
              this.amount,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 11)
            );
          },
        },
      ],
      transfer: {
        value: leftPadHex(erc20.transfer, 32),
        commitmentIndex: 2,
        get commitment() {
          return utils.concatenateThenHash(
            this.value,
            bob.pk,
            this.transferredSalt === undefined ? '0x0' : this.transferredSalt, // S_E - set at erc-20 commitment transfer (step 12)
          );
        },
      },
      change: {
        value: leftPadHex(erc20.change, 32),
        commitmentIndex: 3,
        get commitment() {
          return utils.concatenateThenHash(
            this.value,
            alice.pk,
            this.changeSalt === undefined ? '0x0' : this.changeSalt, // S_F - set at erc-20 commitment transfer (step 12)
          );
        },
      },
    };
  },

  async erc20CommitmentBatchTransfer() {
    const { alice, bob } = this;
    return {
      mint: 40,
      get mintCommitmentValue() {
        return leftPadHex(parseInt(this.mint, 7), 32);
      },
      get commitment() {
        return utils.concatenateThenHash(
          this.mintCommitmentValue,
          alice.pk,
          this.S_A === undefined ? '0x0' : this.S_A, // S_A - set at erc-20 commitment mint (step 18)
        );
      },
      commitmentIndex: 4,
      transferData: [
        {
          value: '0x00000000000000000000000000000002',
          receiverName: bob.name,
          commitmentIndex: 5,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              bob.pk,
              this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
            );
          },
        },
        {
          value: '0x00000000000000000000000000000002',
          receiverName: alice.name,
          commitmentIndex: 6,
          get commitment() {
            return utils.concatenateThenHash(
              this.value,
              alice.pk,
              this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
            );
          },
        },
      ],
    };
  },

  /*
   *  This function will configure dependent test data.
   */
  async configureDependentTestData() {
    this.erc721Commitment = await this.erc721Commitment();
    this.erc20Commitments = await this.erc20Commitments();
    this.erc20CommitmentBatchTransfer = await this.erc20CommitmentBatchTransfer();
  },
};
