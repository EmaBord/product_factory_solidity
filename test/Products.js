const truffleAssert = require('truffle-assertions');
const ProductFactory = artifacts.require("ProductFactory");

contract("ProductFactory", (accounts) => {
    let [ema, thiago] = accounts;
    let contractInstance;
    beforeEach(async () => {
        contractInstance = await ProductFactory.new();
    });
    it("should be able to create a new products", async () => {
        const result = await contractInstance.createProduct("test1", {from: ema});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name,"test1");
        truffleAssert.eventEmitted(result, 'NewProduct', (ev) => {
            return ev.productId == 0 && ev.name=='test1';
        });
        const result2 = await contractInstance.createProduct("test2", {from: thiago});
        assert.equal(result2.receipt.status, true);
        assert.equal(result2.logs[0].args.name,"test2");
        
    })
    it("should be able to delegate product", async () => {
        const result = await contractInstance.createProduct("test3", {from: ema});
        const delegate = await contractInstance.delegateProduct(0, thiago, {from: ema});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name,"test3");
        truffleAssert.eventEmitted(delegate, 'DelegateProduct', (ev) => {
            return ev.productId == 0 && ev.newOwner==thiago && ev.status==1;
        });
        
    })

    it("no should be able to delegate product", async () => {
        const result = await contractInstance.createProduct("test3", {from: ema});
        const delegate = await contractInstance.delegateProduct(0, thiago, {from: ema});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name,"test3");

        await truffleAssert.reverts(
            contractInstance.delegateProduct(0, thiago, {from: ema}),
            "is already delegated"
        );
        
    })

    it("should be able to accept product", async () => {
        const result = await contractInstance.createProduct("test4", {from: ema});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name,"test4");

        const delegate = await contractInstance.delegateProduct(0, thiago, {from: ema});
        assert.equal(delegate.receipt.status, true);


        const tx_accept = await contractInstance.acceptProduct(0, {from: thiago});
        assert.equal(tx_accept.receipt.status, true);
        truffleAssert.eventEmitted(tx_accept, 'AcceptProduct', (ev) => {
            return ev.productId == 0 && ev.name=="test4" && ev.status==0;
        });
        
    })

})