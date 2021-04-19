'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'tdrive12';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);


			// await contract.submitTransaction('InitLedger');

			// let result = await contract.evaluateTransaction('GetAllAssets');
			// console.log(`*** Result: ${prettyJSONString(result.toString())}`);


			try {
				let result = await contract.evaluateTransaction('CreateUser', 'user_tkd@gmail.com', 'tkd@gmail.com', 'tkd1234', 'Tanmoy Krishna Das');
				await contract.submitTransaction('CreateUser', 'user_tkd@gmail.com', 'tkd@gmail.com', 'tkd1234', 'Tanmoy Krishna Das');

				console.log(`Create User Successful\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('CreateUser', 'user_akd@gmail.com', 'akd@gmail.com', 'akd1234', 'Anwoy Krishna Das');
				await contract.submitTransaction('CreateUser', 'user_akd@gmail.com', 'akd@gmail.com', 'akd1234', 'Anwoy Krishna Das');

				console.log(`Create User Successful\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('FindUser', 'tkd@gmail.com', 'tkd1234');

				console.log(`User Found\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			// try {
			// 	let result = await contract.evaluateTransaction('FindUser', 'tkd@gmail.com', '1234tkd');

			// 	console.log(`User Found\n Result: ${result}`);
			// } catch (error) {
			// 	console.log(`*** Error: \n    ${error}\n`);
			// }

			try {
				let result = await contract.evaluateTransaction('CreateFile', 'file_cert.txt_hash123', 'cert.txt', '/files/cert.txt', 'hash123', 'tkd@gmail.com');
				await contract.submitTransaction('CreateFile', 'file_cert.txt_hash123', 'cert.txt', '/files/cert.txt', 'hash123', 'tkd@gmail.com');

				console.log(`File Created\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('CreateFile', 'file_letter.txt_hash567', 'letter.txt', '/files/letter.txt', 'hash567', 'tkd@gmail.com');
				await contract.submitTransaction('CreateFile', 'file_letter.txt_hash567', 'letter.txt', '/files/letter.txt', 'hash567', 'tkd@gmail.com');

				console.log(`File Created\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction(
					'FindFile',
					'file_cert.txt_hash123',
				);

				console.log(`File Found\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('ChangeFileName', 'file_cert.txt_hash123', 'cert_new.txt', "uploads/cert_new.txt");
				await contract.submitTransaction('ChangeFileName', 'file_cert.txt_hash123', 'cert_new.txt', "uploads/cert_new.txt");

				console.log(`File Name Changed\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			// try {
			// 	let result = await contract.evaluateTransaction('DeleteFile', 'file_letter.txt_hash567');
			// 	await contract.submitTransaction('DeleteFile', 'file_letter.txt_hash567');

			// 	console.log(`File Deleted\n Result: ${result}\n`);
			// } catch (error) {
			// 	console.log(`*** Error: \n    ${error}\n`);
			// }

			try {
				const email = 'tkd@gmail.com'
				let result = await contract.evaluateTransaction(
					'FindFileByUser',
					email,
				);

				console.log(`Files Found for email ${email}: \n ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('ShareFile', 'fileShare_cert.txt_hash123', 'file_cert.txt_hash123', 'akd@gmail.com');
				await contract.submitTransaction('ShareFile', 'fileShare_cert.txt_hash123', 'file_cert.txt_hash123', 'akd@gmail.com');

				console.log(`File Shared\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('ShareFile', 'fileShare_letter.txt_hash567', 'file_letter.txt_hash567', 'akd@gmail.com');
				await contract.submitTransaction('ShareFile', 'fileShare_letter.txt_hash567', 'file_letter.txt_hash567', 'akd@gmail.com');

				console.log(`File Shared\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('FindFileShareByFile', 'file_letter.txt_hash567');

				console.log(`File Share List for particular file:\n ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('FindFileSharedWithUser', 'akd@gmail.com');

				console.log(`File Share List for particular user:\n ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

			try {
				let result = await contract.evaluateTransaction('DeleteFileShare', 'fileShare_letter.txt_hash567');
				await contract.submitTransaction('DeleteFileShare', 'fileShare_letter.txt_hash567');

				console.log(`File Share deleted\n Result: ${result}\n`);
			} catch (error) {
				console.log(`*** Error: \n    ${error}\n`);
			}

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
