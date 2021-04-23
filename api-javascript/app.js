'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'tdrive';
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

			/////////////////////////////////////////////////////////////////////
			const express = require('express');
			const cookieParser = require('cookie-parser');
			const fileUpload = require('express-fileupload');
			const path = require('path');
			const crypto = require('crypto');
			const fs = require('fs');
			const util = require('util');
			var cors = require('cors')


			let app = express();
			const PORT = 3000;

			app.use(cors({
				origin: "http://localhost:3001",
				credentials: true
			}));

			app.use(cookieParser());
			app.use(express.urlencoded({ extended: false }))
			app.use(express.json())

			app.use(express.static('public'))

			app.use(fileUpload({
				useTempFiles: true,
				tempFileDir: 'tmp/',
				createParentPath: true
			}));

			app.get('/', function (req, res) {
				res.send('Welcome to T-Drive!');
			});

			app.get('/book', function (req, res) {
				res.send('Hello Book Readers!');
			});

			app.post('/register', async function (req, res) {
				const { email, password, name } = req.body;
				const key = `user_${email}`;

				try {
					let result = await contract.evaluateTransaction('CreateUser', key, email, password, name);
					await contract.submitTransaction('CreateUser', key, email, password, name);

					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}
			})

			app.post('/login', async function (req, res) {
				const { email, password } = req.body;

				try {
					let result = await contract.evaluateTransaction('FindUser', email, password);

					res.cookie('user', result.toString(), { maxAge: 3600_000, httpOnly: true });
					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}
			})

			app.get('/logout', async function (req, res) {
				const { email, password } = req.body;

				try {
					res.cookie('user', '', { maxAge: -1, httpOnly: true });
					res.send("You have successfully logged out");
				} catch (error) {
					res.status(400).send(error.toString());
				}
			})

			app.get('/profile', async function (req, res) {
				if (req.cookies.user == null) {
					res.json({
						isLoggedIn: false
					});
					return;
				}

				try {
					let user = JSON.parse(req.cookies.user.toString());
					const key = user.Key;

					let result = await contract.evaluateTransaction('FindUserByKey', key);

					user = JSON.parse(result.toString());
					user.isLoggedIn = true;

					res.json(user);
				} catch (error) {
					res.status(500).send(`Error: ${error}`);
				}
			})

			async function sha256(filePath) {
				const readFile = util.promisify(fs.readFile);


				const hash = crypto.createHash('sha256');
				const data = await readFile(filePath);
				hash.update(data);

				return hash.digest('base64');
			}

			app.post('/file', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const uploadedFile = req.files?.uploadedFile;
				if (uploadedFile == undefined) {
					res.status(400).send('You must upload a file');
					return;
				}

				const fileName = uploadedFile.name;
				const fileDestination = path.join('public', 'uploadedFiles', fileName);

				uploadedFile.mv(fileDestination, async (err) => {
					if (err != undefined) {
						res.status(500).send(`Server Error, failed to move file ${err}`);
						return;
					}

					try {
						const user = JSON.parse(req.cookies.user.toString());

						const downloadLink = path.join('uploadedFiles', fileName);
						const uploaderEmail = user.Email;
						const key = `file_${uploaderEmail}_${fileName}`;
						const fileHash = await sha256(fileDestination);

						let result = await contract.evaluateTransaction('CreateFile', key, fileName, downloadLink, fileHash, uploaderEmail);
						await contract.submitTransaction('CreateFile', key, fileName, downloadLink, fileHash, uploaderEmail);

						res.send(result.toString());
					} catch (error) {
						res.status(400).send(error.toString());
					}
				});
			})

			app.get('/file', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFileByUser',
						user.Email,
					);

					res.send(result.toString());
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.get('/file/:fileKey', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey = req.params.fileKey;

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile = JSON.parse(result);

					result = await contract.evaluateTransaction(
						'FindFileSharedWithUser',
						user.Email,
					);

					let filesSharedWithMe = JSON.parse(result);
					filesSharedWithMe = filesSharedWithMe.map(data => data.Record);
					console.log(filesSharedWithMe);

					const thisFileSharedWithMe = filesSharedWithMe.some(fileShare => fileShare.FileKey == uploadedFile.Key);

					if (uploadedFile.UploaderEmail != user.Email && !thisFileSharedWithMe) {
						res.status(403).send("You are not authorized to view this file");
					} else {
						res.send(JSON.stringify(uploadedFile));
					}
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.put('/file/:fileKey', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey = req.params.fileKey;

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile = JSON.parse(result);
					const newFileName = req.body.newFileName;

					if (uploadedFile.UploaderEmail != user.Email) {
						res.status(403).send("You are not authorized to update this file");
					} else {
						//move file and update download link
						const renameFile = util.promisify(fs.rename);

						const srcPath = path.join('public', uploadedFile.DownloadLink);
						const destinationPath = path.join('public', 'uploadedFiles', newFileName);
						const err = await renameFile(srcPath, destinationPath);

						const newDownloadLink = path.join('uploadedFiles', newFileName)

						if (err != undefined) {
							res.status(500).send(`Server Error ${err}`);
							return;
						}

						let result = await contract.evaluateTransaction('ChangeFileName', fileKey, newFileName, newDownloadLink);
						await contract.submitTransaction('ChangeFileName', fileKey, newFileName, newDownloadLink);
						res.send(result.toString());
					}
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.delete('/file/:fileKey', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey = req.params.fileKey;

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile = JSON.parse(result);


					if (uploadedFile.UploaderEmail != user.Email) {
						res.status(403).send("You are not authorized to delete this file");
					} else {
						//delete file
						const deleteFile = util.promisify(fs.unlink);

						const srcPath = path.join('public', uploadedFile.DownloadLink);
						const err = await deleteFile(srcPath);

						if (err != undefined) {
							res.status(500).send(`Server Error ${err}`);
							return;
						}

						let result = await contract.evaluateTransaction('DeleteFile', fileKey);
						await contract.submitTransaction('DeleteFile', fileKey);
						res.send(result.toString());
					}
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.post('/fileShare', async function (req, res) {
				const { fileKey, sharedWithEmail } = req.body;
				const key = `fileShare_${fileKey}_${sharedWithEmail}`;

				try {
					let result = await contract.evaluateTransaction('ShareFile', key, fileKey, sharedWithEmail);
					await contract.submitTransaction('ShareFile', key, fileKey, sharedWithEmail)

					res.send(result.toString());
				} catch (error) {
					res.status(400).send(error.toString());
				}
			})

			app.get('/fileShare/byFile/:fileKey', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const fileKey = req.params.fileKey;

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile = JSON.parse(result);

					if (uploadedFile.UploaderEmail != user.Email) {
						res.status(403).send("You are not authorized to view this file");
					} else {
						let result = await contract.evaluateTransaction(
							'FindFileShareByFile',
							fileKey,
						);

						res.send(result.toString());
					}
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.get('/fileShare/withMe', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}


				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFileSharedWithUser',
						user.Email,
					);

					res.send(result.toString());
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			app.delete('/fileShare/:fileShareKey', async function (req, res) {
				if (req.cookies.user == null) {
					res.status(400).send('You are not logged in');
					return;
				}

				const fileShareKey = req.params.fileShareKey;

				try {
					const user = JSON.parse(req.cookies.user.toString());
					let result = await contract.evaluateTransaction(
						'FindFileShare',
						fileShareKey,
					);
					const fileShare = JSON.parse(result);

					const fileKey = fileShare.FileKey;
					result = await contract.evaluateTransaction(
						'FindFile',
						fileKey,
					);

					const uploadedFile = JSON.parse(result);

					if (uploadedFile.UploaderEmail != user.Email && fileShare.SharedWithEmail != user.Email) {
						res.status(403).send("You are not authorized to delete this file");
					} else {
						let result = await contract.evaluateTransaction('DeleteFileShare', fileShareKey);
						await contract.submitTransaction('DeleteFileShare', fileShareKey);
						res.send(result.toString());
					}
				} catch (err) {
					res.status(400).send(err.toString());
				}
			})

			var server = app.listen(PORT, function () {
				console.log(`Server Listening on port http://localhost:${PORT}`);
			});
			////////////////////////////////////////////////////////////////////

		} finally {
			// gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();
