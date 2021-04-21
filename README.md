# T-Drive

This project is part of a tutorial on Hyperledger Fabric showing how to use Hyperledger fabric to build a clone of google drive.

[T-Drive Architecture](https://docs.google.com/document/d/1iwQB-mA_mt-EBii82ag-JqQnZ1wzh4Gpo5NNakv_OeA/edit?usp=sharing)

[Hyperledger Fabric basic commands](https://docs.google.com/document/d/1rxkKLTBvLzJWgeDJLeHCdrxd0PaZmecAYGs__HLhVug/edit?usp=sharing)

[Coding Walkthrough (Video)](https://drive.google.com/file/d/1YTPpuau8ykhPuIpt4D0L9B42WzXBTaRj/view?usp=sharing)

## Prerequisites: (Git, Curl, Docker, Docker-compose)

### Installing Git and Curl

```bash
sudo apt install -y git curl
```

### Installing Node.JS

```bash
#install nvm (node version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

source ~/.bashrc

#install lts version of node
nvm install --lts
nvm use --lts
nvm alias default --lts
```


### Installing Docker

To install docker on your ubuntu machine, follow the steps from the tutorials given below:
- [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)

### Activate Docker Group (Executing the Docker Command Without Sudo)

By default, the docker command can only be run the **root** user or by a user in the docker group, which is automatically created during Docker's installation process. If you attempt to run the `docker` command without prefixing it with `sudo` or without being in the **docker** group, you'll get an output like this:

> docker: Cannot connect to the Docker daemon. Is the docker daemon running on this host?.
See 'docker run --help'.

If you want to avoid typing sudo whenever you run the docker command, add your username to the docker group:

```bash
sudo usermod -aG docker ${USER}

su - ${USER}
```

Confirm that your user is now added to the docker group by typing:

```bash
id -nG
```
If everything went well, you'll see **docker** in the output

### Installing Docker Compose

To install docker compose on your ubuntu machine, follow the steps from the tutorials given below:
- [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/
)

### Installing Hyperledger Fabric:

```bash
cd $HOME
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s
```

### Setting Up Environment Variables:

```bash
echo export PATH=\$PATH:\$HOME/fabric-samples/bin | tee -a ~/.bashrc

echo export FABRIC_CFG_PATH=$HOME/fabric-samples/config | tee -a ~/.bashrc

source ~/.bashrc
```

### Downloading T-Drive

```bash
cd $HOME/fabric-samples

git clone https://github.com/Tanmoytkd/T-Drive t-drive

cd $HOME/fabric-samples/t-drive/chaincode-javascript
npm install

cd $HOME/fabric-samples/t-drive/api-javascript
npm install
```

## Starting Blockchain Test Network and Install T-Drive Chaincode

```bash
cd $HOME/fabric-samples/test-network

# Start Test Network
./network.sh createChannel -ca -c mychannel -s couchdb

# Deleting the existing wallet from previous test network
rm -rf $HOME/fabric-samples/t-drive/api-javascript/wallet

# Install Chaincode
./network.sh deployCC -ccn tdrive -ccp /home/tanmoy.das/fabric-samples/t-drive/chaincode-javascript/ -ccl javascript
```

## Starting T-Drive API

```bash
cd $HOME/fabric-samples/t-drive/api-javascript

npm install

node app.js
```

You can test the API with the **REST CLIENT** vs code extension. The tests are written in the file **api_test.rest**.

## Viewing Blockchain State in CouchDB

You can view the current state at [http://localhost:5984/_utils/](http://localhost:5984/_utils/).

**Username:** admin  
**Password:** adminpw

## Stopping Test Network

```bash
cd $HOME/fabric-samples/test-network

./network.sh down
```
