const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Steve token", async function() {
    let addrs;
    let alice;
    let bob;
    let deployer;
    let steve;
    let Token;

    const allowance = BigInt("1000000000000000000000"); // 1000 tokens with 18 decimals
    const initialMint = BigInt("1000000000000000000000000"); // 1 million tokens with 18 decimals
    const bigAllowance = BigInt("10000000000000000000000000"); // 10 million tokens with 18 decimals
    const tokenName = "Steve Token";
    const tokenSymbol = "STEVE";
    const transferAmount = BigInt("1000000000000000000000"); // 1000 tokens with 18 decimals
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const newMint = BigInt("1000000000000000000") // 1 token with 18 decimals

    this.beforeEach(async () => {
        Token = await ethers.getContractFactory("Steve");
        [deployer, alice, bob, ...addrs] = await ethers.getSigners();

        steve = await Token.deploy(tokenName, tokenSymbol, initialMint);
    });

    describe("Deployment", async () => {
        it("should set the deployer as the owner", async () => {
            expect(await steve.owner()).to.equal(deployer.address);
        });

        it("should be unpaused by default", async () => {
            expect(await steve.paused()).to.equal(false);
        });

        describe("Initial mint", async function() {
            let initialSupply;
            
            this.beforeEach(async () => {
                initialSupply = await steve.totalSupply();
            });

            it("should mint the specified initial supply upon deployment", async () => {
                expect(initialSupply.toString()).to.equal(initialMint.toString());
            });
    
            it("the entire initial supply should be assigned to the deployer", async () => {
                const deployerBalance = await steve.balanceOf(deployer.address);
                expect(deployerBalance.toString()).to.equal(initialSupply.toString());
            });
        });
    });
    describe("Transfers", async function() {
        let sender;
        let recipient;
        
        this.beforeEach(async () => {
            sender = deployer.address;
            recipient = alice.address;
        })

        it("should emit transfer event", async () => {
            await expect(steve.transfer(recipient, transferAmount))
                    .to.emit(steve, "Transfer")
                    .withArgs(sender, recipient, transferAmount)
        });
        it("should decrease sender's balance", async () => {
            await steve.transfer(recipient, transferAmount);
            expect(await steve.balanceOf(sender)).to.equal(initialMint - transferAmount);
        });
        it("should increase recipient's balance", async () => {
            await steve.transfer(recipient, transferAmount);
            expect(await steve.balanceOf(recipient)).to.equal(transferAmount);
        });
        it("should not allow transferring more than the total balance", async () => {
            await expect(steve.transfer(recipient, initialMint + 1n))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
        it("should not allow transfers to 0 address", async() => {
            await expect(steve.transfer(zeroAddress, 1))
                .to.be.revertedWith("ERC20: transfer to the zero address");
        });
    });
    describe("Allowances", async function() {
        let owner;
        let recipient;
        let spender;
        
        this.beforeEach(async () => {
            owner = deployer.address;
            spender = alice.address;
            recipient = bob.address;
        })

        it("should allow to set allowance for a spender of a owner account", async () => {
            await expect(steve.approve(spender, allowance));
        })

        it("should emit Approval event", async () => {
            await expect(steve.approve(spender, allowance))
                    .to.emit(steve, "Approval")
                    .withArgs(owner, spender, allowance);
        });
        it("should allow to spend funds of owner given sufficient spender approval", async () => {
            await steve.approve(spender, allowance);
            await expect(steve.connect(alice).transferFrom(owner, recipient, transferAmount));
        });
        it("should decrease allowance after spending by spender", async () => {
            await steve.approve(spender, allowance);
            await steve.connect(alice).transferFrom(owner, recipient, transferAmount);
            const finalAllowance = await steve.allowance(owner, spender);
            expect(finalAllowance.toString()).to.equal("0");
        });
        it("should not allow overspending of approval", async () => {
            await steve.approve(spender, allowance);
            await expect(steve.connect(alice).transferFrom(owner, recipient, allowance + 1n))
                    .to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });
        it("should not allow overspending of owner's balance even with sufficient allowance", async () => {
            await steve.approve(spender, bigAllowance);
            await expect(steve.connect(alice).transferFrom(owner, recipient, bigAllowance))
                    .to.be.revertedWith("ERC20: transfer amount exceeds balance");

        });
        it("should not allow approvals to 0 address", async () => {
            await expect(steve.approve(zeroAddress, allowance))
                    .to.be.revertedWith("ERC20: approve to the zero address");
        });
    });
    describe("Owner", () => {
        it("should be able to transfer ownership", async () => {
            expect(await steve.transferOwnership(alice.address));
            const newOwnerAddress = await steve.owner();
            expect(newOwnerAddress.toString()).to.equal(alice.address.toString());
        });
    })
    describe("Minting", async () => {
        it("owner should be able to mint new tokens", async () => {
            expect(await steve.mint(newMint));
        });
        it("nobody but owner should be able to mint", async () => {
            await expect(steve.connect(alice).mint(newMint))
            .to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("entire mint amount should be assigned to minter", async () => {
            const initialBalance = await steve.balanceOf(deployer.address);
            await steve.mint(newMint);
            const finalBalance = await steve.balanceOf(deployer.address);
            expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(newMint));
        });
        it("minting should increase total supply", async () => {
            const initialSupply = await steve.totalSupply();
            await steve.mint(newMint);
            const newSupply = await steve.totalSupply();
            expect(newSupply).to.gt(initialSupply);
        });
    })
    describe("Pausing", async () => {
        it("owner should be able to pause the contract", async () => {
            expect(await steve.pauseToken());
        });
        it("nobody but the contract owner should be able to pause the contract", async () => {
            await expect(steve.connect(alice).pauseToken())
            .to.be.revertedWith("Ownable: caller is not the owner")
            
        });
        it("should not allow token transfers when paused", async () => {
            await steve.pauseToken();
            await expect(steve.transfer(alice.address, transferAmount))
            .to.be.revertedWith("Pausable: paused")
        });
        it("owner should be able to unpause the contract", async () => {
            await steve.pauseToken();
            expect(await steve.unpauseToken());
        });
        it("nobody but the owner should be able to unpause the contract", async () => {
            await steve.pauseToken();
            await expect(steve.connect(alice).unpauseToken())
            .to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should allow token transfers after unpausing", async () => {
            await steve.pauseToken();
            await steve.unpauseToken();
            expect(await steve.transfer(alice.address, transferAmount));
        });
    })
});