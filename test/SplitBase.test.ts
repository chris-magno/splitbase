import { expect } from "chai";
import { ethers } from "hardhat";
import { SplitBase } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SplitBase", function () {
  let splitBase: SplitBase;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let stranger: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob, carol, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SplitBase");
    splitBase = (await Factory.deploy()) as SplitBase;
    await splitBase.waitForDeployment();
  });

  // ─── Group Creation ──────────────────────────────────────────────────────────
  describe("createGroup", () => {
    it("creates a group and emits GroupCreated", async () => {
      const tx = await splitBase
        .connect(alice)
        .createGroup("Trip to Vegas", [bob.address, carol.address]);
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const { name, members, exists } = await splitBase.getGroup(1);
      expect(name).to.equal("Trip to Vegas");
      expect(exists).to.be.true;
      expect(members).to.include(alice.address);
      expect(members).to.include(bob.address);
    });

    it("registers creator as member", async () => {
      await splitBase.connect(alice).createGroup("Dinner", [bob.address]);
      expect(await splitBase.isMember(1, alice.address)).to.be.true;
    });

    it("increments groupCount", async () => {
      await splitBase.connect(alice).createGroup("A", [bob.address]);
      await splitBase.connect(alice).createGroup("B", [bob.address]);
      expect(await splitBase.groupCount()).to.equal(2n);
    });
  });

  // ─── Add Expense ─────────────────────────────────────────────────────────────
  describe("addExpense", () => {
    let groupId: bigint;

    beforeEach(async () => {
      await splitBase
        .connect(alice)
        .createGroup("House", [bob.address, carol.address]);
      groupId = 1n;
    });

    it("splits expense equally and records balances", async () => {
      // Alice pays 0.003 ETH for 3 people → 0.001 each
      const amount = ethers.parseEther("0.003");
      await splitBase
        .connect(alice)
        .addExpense(groupId, "Groceries", { value: amount });

      const bobOwes = await splitBase.getBalance(groupId, bob.address, alice.address);
      const carolOwes = await splitBase.getBalance(groupId, carol.address, alice.address);

      expect(bobOwes).to.equal(ethers.parseEther("0.001"));
      expect(carolOwes).to.equal(ethers.parseEther("0.001"));
    });

    it("reverts for non-members", async () => {
      await expect(
        splitBase
          .connect(stranger)
          .addExpense(groupId, "Hack", { value: ethers.parseEther("0.001") })
      ).to.be.revertedWithCustomError(splitBase, "NotMember");
    });

    it("reverts for zero value", async () => {
      await expect(
        splitBase.connect(alice).addExpense(groupId, "Free", { value: 0n })
      ).to.be.revertedWithCustomError(splitBase, "ZeroValue");
    });
  });

  // ─── Settle ──────────────────────────────────────────────────────────────────
  describe("settle", () => {
    let groupId: bigint;
    const expense = ethers.parseEther("0.003");
    const share = ethers.parseEther("0.001");

    beforeEach(async () => {
      await splitBase
        .connect(alice)
        .createGroup("House", [bob.address, carol.address]);
      groupId = 1n;
      await splitBase
        .connect(alice)
        .addExpense(groupId, "Groceries", { value: expense });
    });

    it("transfers ETH to creditor and zeros balance", async () => {
      const aliceBefore = await ethers.provider.getBalance(alice.address);

      await splitBase
        .connect(bob)
        .settle(groupId, alice.address, { value: share });

      const aliceAfter = await ethers.provider.getBalance(alice.address);
      const remaining = await splitBase.getBalance(groupId, bob.address, alice.address);

      expect(aliceAfter - aliceBefore).to.equal(share);
      expect(remaining).to.equal(0n);
    });

    it("reverts with WrongSettlementAmount if wrong value sent", async () => {
      await expect(
        splitBase
          .connect(bob)
          .settle(groupId, alice.address, { value: ethers.parseEther("0.002") })
      ).to.be.revertedWithCustomError(splitBase, "WrongSettlementAmount");
    });

    it("reverts with AlreadySettled on double-settle", async () => {
      await splitBase
        .connect(bob)
        .settle(groupId, alice.address, { value: share });

      await expect(
        splitBase
          .connect(bob)
          .settle(groupId, alice.address, { value: share })
      ).to.be.revertedWithCustomError(splitBase, "AlreadySettled");
    });
  });
});
