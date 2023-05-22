import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// set up console user commands
const rl = readline.createInterface({ input, output });

// load env file - For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Greeter contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("Greeter");

  //Prompt user to provide constructor greeting
  const greeting = await rl.question('Greeting: ');

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact, [greeting]);

  // ⚠️ OPTIONAL: You can skip this block if your account already has funds in L2
  // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  // Get confirmation to proceed from user
  await confirmTx(deployer, artifact, greeting);

}

async function confirmTx(deployer, artifact, greeting) {
  //User confirmation?
  const answer = await rl.question("Confirm deployment? [y/n]: ");

  //Yes: proceed with deployment
  if (answer.toLowerCase() === "y") {
    const greeterContract = await deployer.deploy(artifact, [greeting]);

    //obtain the Constructor Arguments
    console.log(
      "constructor args:" + greeterContract.interface.encodeDeploy([greeting])
    );

    // Show the contract info.
    const contractAddress = greeterContract.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
    return;
  }
  
  //No: revert deployment
  console.log("Transaction not confirmed. Exiting.");
  process.exit(1);
}
