const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

/**
 * Deploy AuctionMarketplace.
 * Tham số `adminAddress` có thể truyền khi deploy:
 *   npx hardhat ignition deploy ignition/modules/AuctionMarketplace.js \
 *     --parameters '{"AuctionMarketplaceModule":{"adminAddress":"0xYourAdminAddress"}}'
 * Mặc định dùng account đầu tiên (deployer) làm admin nếu không truyền tham số.
 */
module.exports = buildModule('AuctionMarketplaceModule', (m) => {
  const admin = m.getAccount(0);
  const adminAddress = m.getParameter('adminAddress', admin);

  const auctionMarketplace = m.contract('AuctionMarketplace', [adminAddress]);

  return { auctionMarketplace };
});
