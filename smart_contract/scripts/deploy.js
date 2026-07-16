const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying với tài khoản:', deployer.address);

  const AuctionMarketplace = await hre.ethers.getContractFactory('AuctionMarketplace');
  const marketplace = await AuctionMarketplace.deploy(deployer.address); // deployer = admin
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log('AuctionMarketplace đã deploy tại:', address);

  // Đợi vài block trước khi verify trên mạng thật (Sepolia)
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    console.log('Đợi 5 block để verify...');
    await marketplace.deploymentTransaction().wait(5);

    try {
      await hre.run('verify:verify', {
        address,
        constructorArguments: [deployer.address],
      });
    } catch (err) {
      console.log('Verify thất bại (có thể đã verify rồi):', err.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
