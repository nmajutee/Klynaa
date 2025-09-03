const { expect } = require("chai");

describe("TrashBeeToken", function () {
    it("deploys with basic metadata", async function () {
        const factory = await ethers.getContractFactory("TrashBeeToken");
        const token = await factory.deploy();
        await token.waitForDeployment();
        expect(await token.name()).to.equal("TrashBeeToken");
    });
});
