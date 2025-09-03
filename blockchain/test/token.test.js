const { expect } = require("chai");

describe("KlynaaToken", function () {
    it("deploys with basic metadata", async function () {
        const factory = await ethers.getContractFactory("KlynaaToken");
        const token = await factory.deploy();
        await token.waitForDeployment();
        expect(await token.name()).to.equal("KlynaaToken");
        expect(await token.symbol()).to.equal("KLY");
        expect(await token.decimals()).to.equal(18);
    });
});
