const MultiSigWallet = artifacts.require('MultiSigWallet');
const AbcToken = artifacts.require('AbcToken');

contract('MultiSigWallet', (accounts) => {

    let txid;
    
    // Token created 
    it('Create Token with total supply', async () => {
        const abcToken = await AbcToken.deployed();
        
        let token_totalSupply = await abcToken.totalSupply.call({from: accounts[0]});    
        assert.equal(token_totalSupply, 100000000, "token totalSupply != 100000000, current token totalSupply = " + token_totalSupply . toString());
        console.log("Token supply checked");

    });
    
    // Transfer from Token to Contract
    it('Transfer balance to contract from token owner account', async () => {
        const multiSigWallet = await MultiSigWallet.deployed();
        const abcToken = await AbcToken.deployed();

        await abcToken.transferFrom(accounts[0], multiSigWallet.address, 1000000, {from: accounts[0]});
        console.log("Transfer from Token to Contract");

    });
    
    // Check contract balance
    it('Check contract balance', async () => {
        const multiSigWallet = await MultiSigWallet.deployed();
        const abcToken = await AbcToken.deployed();

        let balance = await abcToken.balanceOf.call(multiSigWallet.address, {from: accounts[0]});
        assert.equal(balance.words[0], 1000000, "contract balance != 1000000, current contract balance = " + balance.words[0] . toString())
        console.log("Contract Balance checked");

    });

    // Create Draft Transaction 0 and 1
    it('Submit command', async () => {
        const multiSigWallet = await MultiSigWallet.deployed();
        
        txid = await multiSigWallet.submit.call(accounts[0], 1, '0x0', {from: accounts[0]});
        await multiSigWallet.submit(accounts[1], 1, '0x0', {from: accounts[0]});
        assert.equal(txid, 0, "Txid != 0, current txid = " + txid . toString()); 
        console.log("Transaction 1 created");

        txid = await multiSigWallet.submit.call(accounts[1], 1, '0x0', {from: accounts[0]});
        await multiSigWallet.submit(accounts[1], 1, '0x0', {from: accounts[0]});
        assert.equal(txid, 1, "Txid != 1, current txid = " + txid . toString()); 
        console.log("Transaction 2 created");
    });

    // Check Signatures Count + Revoke + Check Execute Transaction with Revoke
    it('Confirm command', async () => {
        const multiSigWallet = await MultiSigWallet.deployed();
        const abcToken = await AbcToken.deployed();

        let confirms_count;

        // Sign 1
        await multiSigWallet.confirm(txid, {from: accounts[0]});
        confirms_count = await multiSigWallet.getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 1, 'Confirms count != 1 after confirm!');
        console.log("Sign 1");

        // Sign 2
        await multiSigWallet.confirm(txid, {from: accounts[1]});
        confirms_count = await multiSigWallet.getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 2, 'Confirms count != 2 after confirm!');
        console.log("Sign 2");

        // Revoke Sign 2
        await multiSigWallet.revoke(txid, {from: accounts[1]});
        confirms_count = await multiSigWallet.getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 1, 'Confirms count != 1 after revoke!');
        console.log("Revoke Sign 2");

        // Sign 2
        await multiSigWallet.confirm(txid, {from: accounts[1]});
        confirms_count = await multiSigWallet.getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 2, 'Confirms count != 2 after confirm!');
        console.log("Sign 2");

        // Display Contract Balance before Transfer 
        balance = await abcToken.balanceOf.call(multiSigWallet.address, {from: accounts[0]});
        console.log("Balance of contract before transfer", balance.words[0]);

        // Display Address[0] Balance before Transfer 
        balance = await abcToken.balanceOf.call(accounts[1], {from: accounts[0]});
        console.log("Balance of accounts[1] before transfer", balance.words[0]);

        // Sign 3
        await multiSigWallet.confirm(txid, {from: accounts[2]});
        confirms_count = await multiSigWallet.getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 3, 'Confirms count != 3 after confirm!');
        console.log("Sign 3 and auto transfer");

        // Contract Balance AFTER Transfer 
        balance = await abcToken.balanceOf.call(multiSigWallet.address, {from: accounts[0]});
        console.log("balance of contract before transfer", balance.words[0]);

        // Address[1] Balance AFTER Transfer 
        balance = await abcToken.balanceOf.call(accounts[1], {from: accounts[0]});
        console.log("balance of accounts[1] after transfer", balance.words[0]);

        let ch_val = true;

        /* 
        try {
            await multiSigWallet.execute.call(txid, {from: accounts[0]});
            ch_val = false;
        } catch {
            console.log('Failed to execute with 2 confirmations');
        }
        
        
        assert.equal(ch_val, true, 'Executed with only 2 confirmations');

        await multiSigWallet.confirm(txid, {from: accounts[1]});
        confirms_count = await multiSigWallet._getConfirmationCount.call(txid, {from: accounts[0]});
        assert.equal(confirms_count, 3, 'Confirms count != 3 after confirm!');
        */

    });   

    // Display Token Balance + Send Transaction + Display New Token Balance 
    /* 
    it('Execute command', async () => {
        const multiSigWallet = await MultiSigWallet.deployed();
        const abcToken = await AbcToken.deployed();
        
        let balance;

    
        // await multiSigWallet.execute(txid, {from: accounts[2]});

        balance = await abcToken.balanceOf.call(multiSigWallet.address, {from: accounts[0]});
        console.log("balance of contract after (token)", balance.words[0]);

        balance = await abcToken.balanceOf.call(accounts[1], {from: accounts[0]});
        console.log("balance of accounts[1] after (token)", balance.words[0]);

    }); */ 
})