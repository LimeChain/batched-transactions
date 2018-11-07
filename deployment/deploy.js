const etherlime = require('etherlime');
const ECTools = require('../build/ECTools.json');
const MetaBatchProxy = require('../build/MetaBatchProxy.json');
const MetaToken = require('../build/MetaToken.json');
const Billboard = require('../build/Billboard.json');
const ethers = require('ethers');
const utils = ethers.utils;


const deploy = async (network, secret) => {
	const deployer = new etherlime.EtherlimeGanacheDeployer('0x823d590ed2cb5e8493bb0efc834771c1cde36f9fc49b9fe3620ebd0754ad6ea2');
	const wallet = deployer.wallet;

	// Deploying contracts
	const MetaTokenContract = await deployer.deploy(MetaToken);
	const ECToolsContract = await deployer.deploy(ECTools);
	const MetaBatchContract = await deployer.deploy(MetaBatchProxy, { ECTools: ECToolsContract.contractAddress }, wallet.address)
	const BillboardContract = await deployer.deploy(Billboard, {}, MetaTokenContract.contractAddress);

	// Mint tokens
	const tx = await MetaTokenContract.contract.mint(MetaBatchContract.contractAddress, 10000);
	await MetaTokenContract.verboseWaitForTransaction(tx, 'Minting Transaction');

	// Generate approve meta transaction 
	const approveData = MetaTokenContract.contract.interface.functions.approve.encode([BillboardContract.contractAddress, 100]);

	const approveHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [MetaTokenContract.contractAddress, 0, utils.arrayify(approveData)]);
	const hashData = ethers.utils.arrayify(approveHash);
	const approveDataSignature = await wallet.signMessage(hashData);

	// Generate buy meta transaction
	const buySloganData = BillboardContract.contract.interface.functions.buy.encode(['Ogi Maistora', 100]);

	const buySloganHash = utils.solidityKeccak256(['address', 'uint256', 'bytes'], [BillboardContract.contractAddress, 0, utils.arrayify(buySloganData)]);
	const hashData2 = ethers.utils.arrayify(buySloganHash);
	const buySloganDataSignature = await wallet.signMessage(hashData2);

	// Execute batched transactions
	const execute1 = await MetaBatchContract.contract.execute([MetaTokenContract.contractAddress, BillboardContract.contractAddress], [0, 0], [approveData, buySloganData], [approveDataSignature, buySloganDataSignature], {
		gasLimit: 4700000,
		gasPrice: utils.bigNumberify("20000000000")
	});
	await MetaBatchContract.verboseWaitForTransaction(execute1, 'Successful Execution');

	const balance = await MetaTokenContract.contract.balanceOf(MetaBatchContract.contractAddress);
	console.log('Identity balance after Success:', balance.toString()); // Supposed to be 9900

	const balance2 = await MetaTokenContract.contract.balanceOf(BillboardContract.contractAddress);
	console.log('Billboard balance after Success:', balance2.toString()); // Supposed to be 100

	const allowance = await MetaTokenContract.contract.allowance(MetaBatchContract.contractAddress, BillboardContract.contractAddress);
	console.log('Billboard allowance after Success:', allowance.toString()); // Supposed to be 0

	try {
		const execute2 = await MetaBatchContract.contract.execute([MetaTokenContract.contractAddress, BillboardContract.contractAddress], [0, 0], [approveData, buySloganData], [approveDataSignature, buySloganDataSignature], {
			gasLimit: 4700000,
			gasPrice: utils.bigNumberify("20000000000")
		});
		await MetaBatchContract.verboseWaitForTransaction(execute2, 'Failing Execution');

	} catch (e) { }

	const balanc3 = await MetaTokenContract.contract.balanceOf(MetaBatchContract.contractAddress);
	console.log('Identity balance after Fail:', balanc3.toString()); // Supposed to be 9900

	const balance4 = await MetaTokenContract.contract.balanceOf(BillboardContract.contractAddress);
	console.log('Billboard balance after Fail:', balance4.toString()); // Supposed to be 100

	const allowance1 = await MetaTokenContract.contract.allowance(MetaBatchContract.contractAddress, BillboardContract.contractAddress);
	console.log('Billboard allowance after Fail:', allowance1.toString()); // Supposed to be 0

};

module.exports = {
	deploy
};